#!/usr/bin/env bash
# Read-only audit of every worktree of one or more repositories. It prints one
# TSV row for each worktree with a suggested bucket, and it deletes nothing.
set -euo pipefail

usage() {
  cat >&2 <<'EOF'
Usage: worktree-audit.sh [-b <base-ref>] [-d <days>] [<repo-path>...]

Prints one TSV row for each worktree that `git worktree list` reports, for each
repository (default: the current one). It changes nothing.

  -b <base-ref>  Ref for the merge check. Default: origin/HEAD, else main.
  -d <days>      Activity in fewer than <days> days makes a worktree in-use?. Default: 7.

Columns:
  path         from `git worktree list`
  branch       the branch, or detached
  size_kb      `du -sk` of the folder, ignored build output and nested worktrees included
  commit_days  age of the last commit
  idle_days    days since the last commit, checkout or staging
  merged       yes when the base has every commit (merged or cherry-picked), no, or ? without a base
  tracked      tracked files with uncommitted changes
  untracked    untracked files that are not ignored
  owner        adam-mode:<run>/<unit> from a run manifest, a hidden folder in the path such as .herdr/, or -
  bucket       main (the main worktree), keep (uncommitted tracked work), in-use? (recent
               activity), safe (clean, merged and idle) or review (everything else)

A bucket is advice, not permission to delete.
Exit codes: 0 done, 1 not a git repository or unknown base, 2 usage.
EOF
  exit 2
}

die() { echo "worktree-audit.sh: $2" >&2; exit "$1"; }

base_arg=""
days=7
while getopts 'b:d:h' opt; do
  case "$opt" in
    b) base_arg="$OPTARG" ;;
    d) days="$OPTARG" ;;
    *) usage ;;
  esac
done
shift $((OPTIND - 1))
case "$days" in "" | *[!0-9]*) die 2 "-d needs a whole number of days" ;; esac
[ $# -gt 0 ] || set -- .

tab="$(printf '\t')"
now="$(date +%s)"

# GNU stat first: BSD stat rejects -c, and GNU stat -f means something else.
mtime() { stat -c %Y "$1" 2>/dev/null || stat -f %m "$1"; }

default_base() {
  local ref
  ref="$(git -C "$1" symbolic-ref -q --short refs/remotes/origin/HEAD || true)"
  if [ -z "$ref" ] && git -C "$1" show-ref --verify --quiet refs/heads/main; then ref=main; fi
  printf '%s\n' "$ref"
}

# yes when <base> holds every commit of <sha>, merged or cherry-picked.
merged() {
  local cherry
  [ -n "$base" ] && [ -n "$wt_head" ] || { echo '?'; return 0; }
  if git -C "$repo" merge-base --is-ancestor "$wt_head" "$base" 2>/dev/null; then echo yes; return 0; fi
  cherry="$(git -C "$repo" cherry "$base" "$wt_head" 2>/dev/null)" || { echo '?'; return 0; }
  case "$cherry" in *+*) echo no ;; *) echo yes ;; esac
}

# Rows of "path<TAB>adam-mode:<run>/<unit>" from every adam-mode run manifest.
manifest_owners() {
  local m run_id unit kind branch path
  for m in "$common"/adam-mode/*.tsv; do
    [ -f "$m" ] || continue
    run_id="$(basename "$m" .tsv)"
    while IFS="$tab" read -r unit kind branch path; do
      [ -n "$path" ] || continue
      if [ -d "$path" ]; then path="$(cd "$path" && pwd -P)"; fi
      printf '%s\tadam-mode:%s/%s\n' "$path" "$run_id" "$unit"
    done < "$m"
  done
}

owner_of() {
  local found
  found="$(P="$wt_path" awk -F '\t' '$1 == ENVIRON["P"] && !seen { print $2; seen = 1 }' <<< "$owners")"
  [ -n "$found" ] || found="$(sed -n 's#^.*/\(\.[^/][^/]*\)/.*$#\1/#p' <<< "$wt_path")"
  printf '%s\n' "${found:--}"
}

emit() {
  local size="-" commit_days="-" idle_days="-" merge tracked="?" untracked="?" bucket
  local ct="" ct_index last="" index_file status_out counts
  merge="$(merged)"
  if [ -d "$wt_path" ]; then
    size="$({ du -sk "$wt_path" 2>/dev/null || true; } | awk 'NR == 1 { print $1 }')"
    ct="$(git -C "$wt_path" log -1 --format=%ct 2>/dev/null || true)"
    last="$ct"
    index_file="$(git -C "$wt_path" rev-parse --path-format=absolute --git-path index 2>/dev/null || true)"
    if [ -n "$index_file" ] && [ -f "$index_file" ]; then
      ct_index="$(mtime "$index_file")"
      if [ -z "$last" ] || [ "$ct_index" -gt "$last" ]; then last="$ct_index"; fi
    fi
    # --no-optional-locks stops status from refreshing the index, so the audit leaves idle_days unchanged.
    if status_out="$(git -C "$wt_path" --no-optional-locks status --porcelain --untracked-files=all 2>/dev/null)"; then
      counts="$(awk '/^\?\?/ { u++; next } NF { t++ } END { print t + 0 "\t" u + 0 }' <<< "$status_out")"
      tracked="${counts%%"$tab"*}"
      untracked="${counts#*"$tab"}"
    fi
  fi
  [ -z "$ct" ] || commit_days=$(((now - ct) / 86400))
  [ -z "$last" ] || idle_days=$(((now - last) / 86400))

  if [ "$is_main" = 1 ]; then
    bucket=main
  elif [ "$tracked" != 0 ] && [ "$tracked" != "?" ]; then
    bucket=keep
  elif [ "$idle_days" != "-" ] && [ "$idle_days" -lt "$days" ]; then
    bucket="in-use?"
  elif [ "$merge" = yes ] && [ "$tracked" = 0 ] && [ "$untracked" = 0 ]; then
    bucket=safe
  else
    bucket=review
  fi
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$wt_path" "$wt_branch" "$size" \
    "$commit_days" "$idle_days" "$merge" "$tracked" "$untracked" "$(owner_of)" "$bucket"
}

audit_repo() {
  local repo="$1" common base owners list line n=0
  local wt_path="" wt_head="" wt_branch="" is_bare=0 is_main=0
  git -C "$repo" rev-parse --git-dir >/dev/null 2>&1 || die 1 "$repo is not inside a git repository"
  common="$(cd "$(git -C "$repo" rev-parse --path-format=absolute --git-common-dir)" && pwd -P)"
  if [ -n "$base_arg" ]; then
    git -C "$repo" rev-parse --verify --quiet "$base_arg^{commit}" >/dev/null || die 1 "unknown base '$base_arg' in $repo"
    base="$base_arg"
  else
    base="$(default_base "$repo")"
  fi
  owners="$(manifest_owners)"
  list="$(git -C "$repo" worktree list --porcelain)"
  while IFS= read -r line; do
    case "$line" in
      "worktree "*)
        wt_path="${line#worktree }"; wt_head=""; wt_branch=detached; is_bare=0
        n=$((n + 1)) ;;
      "HEAD "*) wt_head="${line#HEAD }" ;;
      "branch "*) wt_branch="${line#branch refs/heads/}" ;;
      bare) is_bare=1 ;;
      "")
        if [ -n "$wt_path" ] && [ "$is_bare" = 0 ]; then
          if [ "$n" = 1 ]; then is_main=1; else is_main=0; fi
          emit
        fi
        wt_path="" ;;
    esac
  done <<EOF
$list

EOF
}

printf 'path\tbranch\tsize_kb\tcommit_days\tidle_days\tmerged\ttracked\tuntracked\towner\tbucket\n'
for repo in "$@"; do
  audit_repo "$repo"
done
