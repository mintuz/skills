#!/usr/bin/env bash
# Worktree lifecycle for one adam-mode run. Each run records the worktrees it
# creates, so cleanup removes only those, and only after their work is integrated.
set -euo pipefail

usage() {
  cat >&2 <<'EOF'
Usage: worktree.sh <command> <run-id> [args]

  create  <run-id> <unit> [<start-ref>]  Add a worktree on branch adam/<run-id>/<unit>; print its path.
  base    <run-id> <ref>                 Add a detached checkout of <ref>; print its path.
  release <run-id> <unit> <integration>  Remove the unit's worktree and branch once its work is on <integration>.
  abandon <run-id> <unit>                Remove the unit's worktree and branch without integration; print the commit to recover it.
  cleanup <run-id> <integration>         Release every unit of the run, prune, and list what remains.
  status  <run-id>                       List the run's worktrees.

Exit codes: 0 done, 1 git error, 2 usage, 3 not created by this run,
4 uncommitted changes, 5 work not on the integration branch.
Worktrees go under $ADAM_WORKTREE_ROOT, default <main-worktree>.worktrees/.
EOF
  exit 2
}

die() { echo "worktree.sh: $2" >&2; exit "$1"; }

valid_name() {
  case "$1" in
    "" | . | .. | *[!A-Za-z0-9._-]*) die 2 "invalid name '$1': use letters, digits, '.', '_' and '-'" ;;
  esac
}

[ $# -ge 2 ] || usage
cmd="$1"
run="$2"
shift 2
valid_name "$run"

git rev-parse --git-dir >/dev/null 2>&1 || die 1 "not inside a git repository"
common="$(cd "$(git rev-parse --git-common-dir)" && pwd -P)"
main="$(git worktree list --porcelain | awk 'NR == 1 { sub(/^worktree /, ""); print }')"
root="${ADAM_WORKTREE_ROOT:-$main.worktrees}/$run"
manifest="$common/adam-mode/$run.tsv"

# Manifest rows: unit <TAB> kind (unit|base) <TAB> branch (or -) <TAB> path
lookup() { [ -f "$manifest" ] && awk -F '\t' -v u="$1" '$1 == u { print; exit }' "$manifest"; }

record() {
  mkdir -p "$(dirname "$manifest")"
  printf '%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$4" >> "$manifest"
}

forget() {
  awk -F '\t' -v u="$1" '$1 != u' "$manifest" > "$manifest.tmp"
  mv "$manifest.tmp" "$manifest"
}

field() { printf '%s\n' "$1" | cut -f "$2"; }

require_clean() {
  if [ -d "$1" ] && [ -n "$(git -C "$1" status --porcelain)" ]; then
    die 4 "$1 has uncommitted changes; commit them or report them first"
  fi
}

remove_worktree() {
  if [ -d "$1" ]; then git worktree remove "$1"; else git worktree prune; fi
}

# True when every change on <branch> is on <integration>: merged, cherry-picked or squashed.
# Callers test the result, which disables `set -e` here, so every git step fails closed.
integrated() {
  local branch="$1" target="$2" cherry base files
  git merge-base --is-ancestor "$branch" "$target" && return 0
  cherry="$(git cherry "$target" "$branch")" || return 1
  [ -n "$(printf '%s\n' "$cherry" | awk '/^\+/')" ] || return 0
  base="$(git merge-base "$target" "$branch")" || return 1
  files="$(git diff --name-only "$base" "$branch")" || return 1
  [ -n "$files" ] || return 0
  printf '%s\n' "$files" | tr '\n' '\0' | xargs -0 git diff --quiet "$branch" "$target" --
}

create() {
  local unit="$1" start="${2:-HEAD}" row path branch
  valid_name "$unit"
  row="$(lookup "$unit" || true)"
  if [ -n "$row" ]; then
    path="$(field "$row" 4)"
    [ -d "$path" ] || die 1 "$unit is recorded at $path, but that path is missing; run abandon first"
    printf '%s\n' "$path"
    return 0
  fi
  branch="adam/$run/$unit"
  path="$root/$unit"
  git show-ref --verify --quiet "refs/heads/$branch" && die 1 "branch $branch already exists and is not recorded for this run"
  [ ! -e "$path" ] || die 1 "$path already exists and is not recorded for this run"
  mkdir -p "$root"
  git worktree add -q -b "$branch" "$path" "$start" >&2
  record "$unit" unit "$branch" "$path"
  printf '%s\n' "$path"
}

base() {
  local ref="$1" unit path row
  unit="base-$(printf '%s' "$ref" | tr -c 'A-Za-z0-9._-' '-')"
  row="$(lookup "$unit" || true)"
  if [ -n "$row" ]; then
    field "$row" 4
    return 0
  fi
  git rev-parse --verify --quiet "$ref^{commit}" >/dev/null || die 1 "unknown ref '$ref'"
  path="$root/$unit"
  [ ! -e "$path" ] || die 1 "$path already exists and is not recorded for this run"
  mkdir -p "$root"
  git worktree add -q --detach "$path" "$ref" >&2
  record "$unit" base - "$path"
  printf '%s\n' "$path"
}

release() {
  local unit="$1" target="$2" row kind branch path
  row="$(lookup "$unit" || true)"
  [ -n "$row" ] || die 3 "$unit was not created by run $run; leave it alone"
  kind="$(field "$row" 2)"
  branch="$(field "$row" 3)"
  path="$(field "$row" 4)"
  require_clean "$path"
  if [ "$kind" = unit ]; then
    git rev-parse --verify --quiet "$target^{commit}" >/dev/null || die 1 "unknown integration branch '$target'"
    if git show-ref --verify --quiet "refs/heads/$branch"; then
      integrated "$branch" "$target" || die 5 "$unit has changes that are not on $target; integrate it or abandon it"
    fi
  fi
  remove_worktree "$path"
  if [ "$kind" = unit ] && git show-ref --verify --quiet "refs/heads/$branch"; then
    git branch -q -D "$branch"
  fi
  forget "$unit"
  echo "released $unit ($path)"
}

abandon() {
  local unit="$1" row branch path sha=""
  row="$(lookup "$unit" || true)"
  [ -n "$row" ] || die 3 "$unit was not created by run $run; leave it alone"
  branch="$(field "$row" 3)"
  path="$(field "$row" 4)"
  require_clean "$path"
  remove_worktree "$path"
  if [ "$branch" != - ] && git show-ref --verify --quiet "refs/heads/$branch"; then
    sha="$(git rev-parse "$branch")"
    git branch -q -D "$branch"
  fi
  forget "$unit"
  if [ -n "$sha" ]; then
    echo "abandoned $unit; recover with: git branch $branch $sha"
  else
    echo "abandoned $unit"
  fi
}

status() {
  local unit kind branch path state
  if [ ! -s "$manifest" ]; then
    echo "run $run has no worktrees"
    return 0
  fi
  while IFS="$(printf '\t')" read -r unit kind branch path; do
    if [ ! -d "$path" ]; then
      state=missing
    elif [ -n "$(git -C "$path" status --porcelain)" ]; then
      state=uncommitted
    else
      state=clean
    fi
    printf '%s\t%s\t%s\t%s\t%s\n' "$unit" "$kind" "$branch" "$state" "$path"
  done < "$manifest"
}

cleanup() {
  local target="$1" units unit code=0 rc
  if [ -f "$manifest" ]; then
    units="$(cut -f 1 "$manifest")"
    for unit in $units; do
      rc=0
      # A separate process keeps `set -e` active inside release.
      bash "$0" release "$run" "$unit" "$target" || rc=$?
      [ "$rc" -eq 0 ] || code="$rc"
    done
  fi
  git worktree prune
  if [ -s "$manifest" ]; then
    echo "remaining for run $run:"
    status
  else
    rm -f "$manifest"
    # rmdir removes only empty folders, so another run's worktrees keep the root.
    rmdir "$root" 2>/dev/null || true
    rmdir "$(dirname "$root")" 2>/dev/null || true
    echo "run $run has no worktrees left"
  fi
  return "$code"
}

case "$cmd" in
  create) [ $# -ge 1 ] && [ $# -le 2 ] || usage; create "$@" ;;
  base) [ $# -eq 1 ] || usage; base "$1" ;;
  release) [ $# -eq 2 ] || usage; release "$1" "$2" ;;
  abandon) [ $# -eq 1 ] || usage; abandon "$1" ;;
  cleanup) [ $# -eq 1 ] || usage; cleanup "$1" ;;
  status) [ $# -eq 0 ] || usage; status ;;
  *) usage ;;
esac
