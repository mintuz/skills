#!/usr/bin/env bats

WT="$BATS_TEST_DIRNAME/../../../src/core/skills/adam-mode/scripts/worktree.sh"

setup() {
  REPO="$BATS_TEST_TMPDIR/repo"
  git init -q -b main "$REPO"
  cd "$REPO"
  git config user.email t@example.com
  git config user.name Test
  git config commit.gpgsign false
  echo one > a.txt
  git add a.txt
  git commit -q -m init
}

wt() { bash "$WT" "$@"; }

commit_in() {
  (cd "$1" && echo "$2" > "$3" && git add "$3" && git commit -q -m "$2")
}

@test "create adds a worktree on its own branch outside the repository and is idempotent" {
  run wt create r1 us1
  [ "$status" -eq 0 ]
  path="$output"
  [ -d "$path" ]
  [ "$(git -C "$path" branch --show-current)" = "adam/r1/us1" ]
  case "$path" in "$REPO"/*) false ;; esac
  run wt create r1 us1
  [ "$status" -eq 0 ]
  [ "$output" = "$path" ]
}

@test "release removes a merged unit's worktree and branch" {
  path="$(wt create r1 us1)"
  commit_in "$path" us1 us1.txt
  git merge -q --no-ff -m merge adam/r1/us1
  run wt release r1 us1 main
  [ "$status" -eq 0 ]
  [ ! -d "$path" ]
  ! git show-ref --verify --quiet refs/heads/adam/r1/us1
}

@test "release accepts cherry-picked commits that git branch -d would refuse" {
  path="$(wt create r1 us1)"
  commit_in "$path" us1 us1.txt
  echo other > other.txt && git add other.txt && git commit -q -m other
  git cherry-pick adam/r1/us1 >/dev/null
  run wt release r1 us1 main
  [ "$status" -eq 0 ]
  [ ! -d "$path" ]
  ! git show-ref --verify --quiet refs/heads/adam/r1/us1
}

@test "release accepts squashed commits whose content is on the integration branch" {
  path="$(wt create r1 us1)"
  commit_in "$path" first x.txt
  commit_in "$path" second y.txt
  git merge -q --squash adam/r1/us1 && git commit -q -m squash
  run wt release r1 us1 main
  [ "$status" -eq 0 ]
  [ ! -d "$path" ]
}

@test "release refuses unintegrated work and keeps the worktree and branch" {
  path="$(wt create r1 us1)"
  commit_in "$path" us1 us1.txt
  run wt release r1 us1 main
  [ "$status" -eq 5 ]
  [ -d "$path" ]
  git show-ref --verify --quiet refs/heads/adam/r1/us1
}

@test "release refuses a worktree with uncommitted changes" {
  path="$(wt create r1 us1)"
  echo dirty > "$path/dirty.txt"
  run wt release r1 us1 main
  [ "$status" -eq 4 ]
  [ -d "$path" ]
}

@test "release refuses a unit that this run did not create" {
  git worktree add -q -b spike "$BATS_TEST_TMPDIR/spike"
  run wt release r1 spike main
  [ "$status" -eq 3 ]
  [ -d "$BATS_TEST_TMPDIR/spike" ]
}

@test "cleanup releases integrated units and base checkouts, keeps the rest and leaves foreign worktrees" {
  git worktree add -q -b spike "$BATS_TEST_TMPDIR/spike"
  done_path="$(wt create r1 us1)"
  open_path="$(wt create r1 us2)"
  base_path="$(wt base r1 main)"
  [ -d "$base_path" ]
  commit_in "$open_path" us2 us2.txt
  run wt cleanup r1 main
  [ "$status" -eq 5 ]
  [ ! -d "$done_path" ]
  [ ! -d "$base_path" ]
  [ -d "$open_path" ]
  [ -d "$BATS_TEST_TMPDIR/spike" ]
  [[ "$output" == *"us2"* ]]
}

@test "cleanup leaves another run's worktrees alone and removes only its own empty folders" {
  a="$(wt create r1 us1)"
  b="$(wt create r2 us1)"
  run wt cleanup r1 main
  [ "$status" -eq 0 ]
  [ ! -d "$a" ]
  [ ! -d "$(dirname "$a")" ]
  [ -d "$b" ]
  run wt cleanup r2 main
  [ ! -d "$(dirname "$(dirname "$b")")" ]
}

@test "abandon removes unintegrated work and prints the commit to recover it" {
  path="$(wt create r1 us1)"
  commit_in "$path" us1 us1.txt
  sha="$(git rev-parse adam/r1/us1)"
  run wt abandon r1 us1
  [ "$status" -eq 0 ]
  [ ! -d "$path" ]
  ! git show-ref --verify --quiet refs/heads/adam/r1/us1
  [[ "$output" == *"$sha"* ]]
}

@test "invalid names are rejected before any change" {
  run wt create r1 "../escape"
  [ "$status" -eq 2 ]
  [ "$(git worktree list | wc -l | tr -d ' ')" = "1" ]
}
