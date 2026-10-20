#!/usr/bin/env bash
# Lists what a change removes or weakens compared with its base: deleted tests,
# fewer test cases, skipped tests, suppressed checks, changed check configuration
# and removed exports. It reports candidates; deciding whether each removal was
# approved stays with the reviewer.
set -euo pipefail

if [ $# -lt 1 ] || [ $# -gt 2 ]; then
  echo "Usage: scope-diff.sh <base-ref> [<head-ref>]" >&2
  exit 2
fi
head="${2:-HEAD}"
git rev-parse --verify --quiet "$1^{commit}" >/dev/null || { echo "scope-diff.sh: unknown ref '$1'" >&2; exit 2; }
git rev-parse --verify --quiet "$head^{commit}" >/dev/null || { echo "scope-diff.sh: unknown ref '$head'" >&2; exit 2; }
base="$(git merge-base "$1" "$head")"

TEST_PATH='(^|/)(__tests__|tests?)/|[._-](test|spec)\.[A-Za-z0-9]+$|Tests?\.swift$|_test\.(go|py)$|(^|/)test_[^/]+\.py$'
DOC_PATH='\.(md|mdx|markdown|txt|rst|adoc)$'
TEST_CASE='^[[:space:]]*(it|test|specify)(\.each)?[[:space:]]*[(`]|func test[A-Z_]|@Test([[:space:]]|\(|$)|def test_'
SKIP_FOCUS='\.(skip|only|todo)[[:space:]]*\(|(^|[^A-Za-z0-9_.])(xit|xdescribe|xtest|fit|fdescribe)[[:space:]]*\(|@Disabled|@Ignore|\.disabled\(|XCTSkip|pytest\.mark\.(skip|xfail)|t\.Skip\('
SUPPRESS='eslint-disable|@ts-ignore|@ts-expect-error|@ts-nocheck|# *noqa|# *type: *ignore|swiftlint:disable|//[[:space:]]*nolint|#\[allow\(|biome-ignore|istanbul ignore|c8 ignore'
CHECK_CONFIG='(^|/)\.(github|forgejo|gitea)/workflows/|(^|/)\.gitlab-ci\.yml$|(^|/)\.woodpecker|(^|/)(\.?eslint[^/]*|\.prettierrc[^/]*|prettier\.config\.[^/]*|biome\.jsonc?|tsconfig[^/]*\.json|jest\.config\.[^/]*|vitest\.config\.[^/]*|playwright\.config\.[^/]*|\.swiftlint\.ya?ml|codecov\.ya?ml|\.coveragerc|pytest\.ini|pyproject\.toml|setup\.cfg|\.golangci\.ya?ml|package\.json|Makefile|lefthook\.ya?ml|\.pre-commit-config\.yaml)$'

g() { git -c core.quotePath=false "$@"; }

section() {
  printf '\n## %s\n\n' "$1"
  if [ -n "$2" ]; then printf '%s\n' "$2" | sed 's/^/- /'; else echo "- none"; fi
}

# Changed lines as: A|D <TAB> path <TAB> line <TAB> text (new line numbers for A, old for D).
lines="$(g diff -U0 --no-color --no-ext-diff -M "$base" "$head" | awk '
  /^diff --git / { hunk = 0; next }
  !hunk && /^--- / { old = substr($0, 5); sub(/^a\//, "", old); next }
  !hunk && /^\+\+\+ / { file = substr($0, 5); sub(/^b\//, "", file); if (file == "/dev/null") file = old; next }
  /^@@ / {
    hunk = 1
    split($2, o, ","); split($3, n, ",")
    ol = substr(o[1], 2) + 0; nl = substr(n[1], 2) + 0
    next
  }
  hunk && /^\+/ { printf "A\t%s\t%d\t%s\n", file, nl++, substr($0, 2); next }
  hunk && /^-/ { printf "D\t%s\t%d\t%s\n", file, ol++, substr($0, 2); next }
')"

# Patterns reach awk through ENVIRON because `awk -v` rewrites backslash escapes.
added_matching() {
  printf '%s\n' "$lines" | RE="$1" awk -F '\t' '$1 == "A" && $4 ~ ENVIRON["RE"] { print $2 ":" $3 ": " $4 }'
}

status="$(g diff --name-status -M "$base" "$head")"

# A test that moves to another test path keeps running, so only report renames out of test paths.
deleted_tests="$(printf '%s\n' "$status" | RE="$TEST_PATH" DOC="$DOC_PATH" awk -F '\t' '
  function test(p) { return p ~ ENVIRON["RE"] && p !~ ENVIRON["DOC"] }
  $1 == "D" && test($2) { print $2 " (deleted)" }
  $1 ~ /^R/ && test($2) && !test($3) { print $2 " -> " $3 " (renamed out of test paths)" }
')"

count_cases() { { g show "$1" 2>/dev/null || true; } | RE="$TEST_CASE" awk '$0 ~ ENVIRON["RE"] { n++ } END { print n + 0 }'; }

removed_cases=""
while IFS="$(printf '\t')" read -r kind from to; do
  case "$kind" in
    M) to="$from" ;;
    R*) ;;
    *) continue ;;
  esac
  printf '%s\n' "$to" | grep -Eq "$TEST_PATH" || continue
  printf '%s\n' "$to" | grep -Eq "$DOC_PATH" && continue
  before="$(count_cases "$base:$from")"
  after="$(count_cases "$head:$to")"
  if [ "$after" -lt "$before" ]; then
    removed_cases="${removed_cases:+$removed_cases
}$to: $before -> $after"
  fi
done <<EOF
$status
EOF

config="$(printf '%s\n' "$status" | RE="$CHECK_CONFIG" awk -F '\t' '
  { path = ($1 ~ /^R/) ? $3 : $2 }
  path ~ ENVIRON["RE"] { print path " (" substr($1, 1, 1) ")" }
')"

removed_exports="$(printf '%s\n' "$lines" | awk -F '\t' '
  function name(text,   m) {
    if (match(text, /^[[:space:]]*export[[:space:]]+(default[[:space:]]+)?(declare[[:space:]]+)?(abstract[[:space:]]+)?(async[[:space:]]+)?(function\*?|const|let|var|class|interface|type|enum|namespace)[[:space:]]+[A-Za-z_$][A-Za-z0-9_$]*/)) {
      m = substr(text, RSTART, RLENGTH); sub(/.*[[:space:]]/, "", m); return m
    }
    if (match(text, /^[[:space:]]*(public|open)[[:space:]]+(final[[:space:]]+)?(static[[:space:]]+)?(func|var|let|class|struct|enum|protocol|actor|typealias)[[:space:]]+[A-Za-z_][A-Za-z0-9_]*/)) {
      m = substr(text, RSTART, RLENGTH); sub(/.*[[:space:]]/, "", m); return m
    }
    if (match(text, /^func[[:space:]]+(\([^)]*\)[[:space:]]*)?[A-Z][A-Za-z0-9_]*/)) {
      m = substr(text, RSTART, RLENGTH); sub(/.*[[:space:])]/, "", m); return m
    }
    return ""
  }
  { n = name($4) }
  n == "" { next }
  $1 == "A" { added[n] = 1 }
  $1 == "D" { removed[++count] = n; where[count] = $2 ":" $3 }
  END { for (i = 1; i <= count; i++) if (!(removed[i] in added)) print removed[i] " (" where[i] ")" }
')"

echo "# Scope diff: $(g rev-parse --short "$base")..$(g rev-parse --short "$head")"
section "Test files deleted or renamed" "$deleted_tests"
section "Test cases removed" "$removed_cases"
section "Tests newly skipped or focused" "$(added_matching "$SKIP_FOCUS")"
section "Checks suppressed" "$(added_matching "$SUPPRESS")"
section "Check configuration changed" "$config"
section "Exports removed" "$removed_exports"
