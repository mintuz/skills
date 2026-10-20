#!/usr/bin/env bats

SCRIPTS="$BATS_TEST_DIRNAME/../../../src/core/skills/adam-mode/scripts"
OLD="2020-01-01T00:00:00"

setup() {
  TMP="$(cd "$BATS_TEST_TMPDIR" && pwd -P)"
  REPO="$TMP/repo"
  export GIT_AUTHOR_NAME=Test GIT_AUTHOR_EMAIL=t@example.com
  export GIT_COMMITTER_NAME=Test GIT_COMMITTER_EMAIL=t@example.com
  git init -q -b main "$REPO"
  cd "$REPO"
  old_commit "$REPO" init a.txt
}

audit() { bash "$SCRIPTS/worktree-audit.sh" "$@"; }

# Commits with an old date, so only the index file can make a worktree look recent.
old_commit() {
  (cd "$1" && echo "$2" > "$3" && git add "$3" &&
    GIT_AUTHOR_DATE="$OLD" GIT_COMMITTER_DATE="$OLD" git -c commit.gpgsign=false commit -q -m "$2")
}

# Ages the worktree's index file, which records its last checkout or staging.
make_idle() {
  touch -t 202001010000 "$(cd "$1" && git rev-parse --path-format=absolute --git-path index)"
}

add_wt() {
  git worktree add -q -b "$1" "$TMP/$1" "${2:-main}"
  make_idle "$TMP/$1"
}

# Prints column <n> of the row for <path>. Columns: 1 path, 2 branch, 3 size_kb,
# 4 commit_days, 5 idle_days, 6 merged, 7 tracked, 8 untracked, 9 owner, 10 bucket.
col() {
  printf '%s\n' "$output" | P="$1" C="$2" awk -F '\t' '$1 == ENVIRON["P"] { print $(ENVIRON["C"]) }'
}

@test "prints a header and one row for every worktree that git lists" {
  add_wt a
  git worktree add -q -b b "$TMP/nested/b"
  run audit "$REPO"
  [ "$status" -eq 0 ]
  [ "$(printf '%s\n' "$output" | awk 'NR == 1')" = "$(printf 'path\tbranch\tsize_kb\tcommit_days\tidle_days\tmerged\ttracked\tuntracked\towner\tbucket')" ]
  [ "$(printf '%s\n' "$output" | awk 'NR > 1' | wc -l | tr -d ' ')" = "3" ]
  [ "$(col "$TMP/nested/b" 2)" = "b" ]
  [ "$(col "$TMP/a" 4)" -ge 365 ]
  [ "$(col "$TMP/a" 3)" -gt 0 ]
}

@test "a clean, merged and idle worktree is safe, and the main worktree is never safe" {
  add_wt done
  run audit -d 1 "$REPO"
  [ "$status" -eq 0 ]
  [ "$(col "$TMP/done" 6)" = "yes" ]
  [ "$(col "$TMP/done" 10)" = "safe" ]
  [ "$(col "$REPO" 6)" = "yes" ]
  [ "$(col "$REPO" 10)" = "main" ]
}

@test "uncommitted tracked work is keep, even when merged and idle" {
  add_wt dirty
  echo changed > "$TMP/dirty/a.txt"
  echo new > "$TMP/dirty/new.txt"
  make_idle "$TMP/dirty"
  run audit -d 1 "$REPO"
  [ "$(col "$TMP/dirty" 7)" = "1" ]
  [ "$(col "$TMP/dirty" 8)" = "1" ]
  [ "$(col "$TMP/dirty" 10)" = "keep" ]
}

@test "untracked files alone and unmerged commits both need review" {
  add_wt scratch
  mkdir -p "$TMP/scratch/notes"
  echo x > "$TMP/scratch/notes/one.txt"
  echo y > "$TMP/scratch/notes/two.txt"
  add_wt open
  old_commit "$TMP/open" open open.txt
  make_idle "$TMP/open"
  run audit -d 1 "$REPO"
  [ "$(col "$TMP/scratch" 8)" = "2" ]
  [ "$(col "$TMP/scratch" 10)" = "review" ]
  [ "$(col "$TMP/open" 6)" = "no" ]
  [ "$(col "$TMP/open" 10)" = "review" ]
}

@test "commits that were cherry-picked into the base count as merged" {
  add_wt picked
  old_commit "$TMP/picked" picked picked.txt
  make_idle "$TMP/picked"
  old_commit "$REPO" other other.txt
  git -c commit.gpgsign=false cherry-pick picked >/dev/null
  run audit -d 1 "$REPO"
  [ "$(col "$TMP/picked" 6)" = "yes" ]
  [ "$(col "$TMP/picked" 10)" = "safe" ]
}

@test "a worktree with recent activity is in-use? even with old commits" {
  git worktree add -q -b fresh "$TMP/fresh"
  run audit "$REPO"
  [ "$(col "$TMP/fresh" 4)" -ge 365 ]
  [ "$(col "$TMP/fresh" 5)" = "0" ]
  [ "$(col "$TMP/fresh" 10)" = "in-use?" ]
}

@test "worktrees recorded by an adam-mode run name the run and unit" {
  path="$(bash "$SCRIPTS/worktree.sh" create r1 us1)"
  make_idle "$path"
  git worktree add -q -b hosted "$TMP/.herdr/worktrees/hosted"
  run audit -d 1 "$REPO"
  [ "$(col "$path" 9)" = "adam-mode:r1/us1" ]
  [ "$(col "$TMP/.herdr/worktrees/hosted" 9)" = ".herdr/" ]
  [ "$(col "$REPO" 9)" = "-" ]
}

@test "-b sets the base for the merge check" {
  git branch release
  add_wt feature release
  old_commit "$TMP/feature" feature feature.txt
  make_idle "$TMP/feature"
  git branch -f release feature
  run audit -b main -d 1 "$REPO"
  [ "$(col "$TMP/feature" 6)" = "no" ]
  run audit -b release -d 1 "$REPO"
  [ "$(col "$TMP/feature" 6)" = "yes" ]
}

@test "the default base is the remote HEAD, not the local main" {
  git clone -q "$REPO" "$TMP/clone"
  old_commit "$REPO" upstream up.txt
  git -C "$TMP/clone" fetch -q origin
  git -C "$TMP/clone" worktree add -q -b synced "$TMP/synced" origin/main
  make_idle "$TMP/synced"
  run audit -d 1 "$TMP/clone"
  [ "$status" -eq 0 ]
  [ "$(col "$TMP/synced" 6)" = "yes" ]
}

@test "audits each repository that it is given" {
  git init -q -b main "$TMP/other"
  old_commit "$TMP/other" init b.txt
  add_wt a
  run audit -d 1 "$REPO" "$TMP/other"
  [ "$status" -eq 0 ]
  [ "$(col "$TMP/a" 10)" = "safe" ]
  [ "$(col "$TMP/other" 10)" = "main" ]
}

@test "the audit changes nothing, so a second run gives the same rows" {
  add_wt idle
  echo dirty > "$TMP/idle/a.txt"
  before="$(git worktree list --porcelain; git -C "$TMP/idle" status --porcelain)"
  make_idle "$TMP/idle"
  first="$(audit "$REPO")"
  second="$(audit "$REPO")"
  [ "$first" = "$second" ]
  [ "$(git worktree list --porcelain; git -C "$TMP/idle" status --porcelain)" = "$before" ]
  [ -d "$TMP/idle" ]
  output="$second"
  [ "$(col "$TMP/idle" 10)" = "keep" ]
  [ "$(col "$TMP/idle" 5)" -ge 365 ]
}

@test "a path that is not a git repository fails with exit code 1" {
  mkdir "$TMP/plain"
  run audit "$TMP/plain"
  [ "$status" -eq 1 ]
}
