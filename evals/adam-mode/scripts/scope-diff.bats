#!/usr/bin/env bats

SD="$BATS_TEST_DIRNAME/../../../src/core/skills/adam-mode/scripts/scope-diff.sh"

setup() {
  REPO="$BATS_TEST_TMPDIR/repo"
  git init -q -b main "$REPO"
  cd "$REPO"
  git config user.email t@example.com
  git config user.name Test
  git config commit.gpgsign false
  mkdir -p src
  printf 'export function keep() {}\nexport const gone = 1\n' > src/api.ts
  printf "it('saves', () => {})\nit('loads', () => {})\nit('fails', () => {})\n" > src/api.test.ts
  printf "it('locks', () => {})\n" > src/lock.test.ts
  printf 'name: ci\n' > ci.yml
  mkdir -p .github/workflows && cp ci.yml .github/workflows/ci.yml
  git add -A
  git commit -q -m init
  git switch -q -c feature
}

sd() { bash "$SD" "$@"; }
section() { printf '%s\n' "$output" | awk -v h="## $1" '$0==h{on=1;next} /^## /{on=0} on && NF'; }

@test "a source-only change reports nothing in any section" {
  printf 'export function keep() { return 1 }\nexport const gone = 1\n' > src/api.ts
  git commit -qam change
  run sd main
  [ "$status" -eq 0 ]
  [ "$(printf '%s\n' "$output" | grep -v '^- none$' | grep -c '^- ')" = "0" ]
}

@test "a deleted test file is reported" {
  git rm -q src/lock.test.ts && git commit -qm drop
  run sd main
  [ "$status" -eq 0 ]
  [[ "$(section 'Test files deleted or renamed')" == *"src/lock.test.ts"* ]]
}

@test "a drop in test cases is reported with both counts" {
  printf "it('saves', () => {})\n" > src/api.test.ts
  git commit -qam fewer
  run sd main
  [[ "$(section 'Test cases removed')" == *"src/api.test.ts: 3 -> 1"* ]]
}

@test "a newly skipped test is reported with its file and line" {
  printf "it('saves', () => {})\nit.skip('loads', () => {})\nit('fails', () => {})\n" > src/api.test.ts
  git commit -qam skip
  run sd main
  [[ "$(section 'Tests newly skipped or focused')" == *"src/api.test.ts:2:"* ]]
}

@test "an added suppression is reported" {
  printf '// eslint-disable-next-line\nexport function keep() {}\nexport const gone = 1\n' > src/api.ts
  git commit -qam suppress
  run sd main
  [[ "$(section 'Checks suppressed')" == *"src/api.ts:1:"* ]]
}

@test "a CI configuration change is reported" {
  printf 'name: ci\non: push\n' > .github/workflows/ci.yml
  git commit -qam ci
  run sd main
  [[ "$(section 'Check configuration changed')" == *".github/workflows/ci.yml"* ]]
}

@test "a removed export is reported but a moved export is not" {
  printf 'export function keep() {}\n' > src/api.ts
  printf 'export function moved() {}\n' > src/b.ts
  git add -A && git commit -qm setup
  git switch -q main && git merge -q feature && git switch -q -c feature2
  printf '' > src/b.ts
  printf 'export function keep() {}\nexport function moved() {}\n' > src/api.ts
  git commit -qam move
  run sd main
  [ "$(section 'Exports removed')" = "- none" ]
  git switch -q main && git switch -q -c feature3
  printf '' > src/api.ts && git commit -qam remove
  run sd main
  [[ "$(section 'Exports removed')" == *"keep"* ]]
}
