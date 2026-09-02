---
name: asc-screenshots
description: >
  WHEN uploading, replacing, or updating App Store screenshots or previews for a
  version or locale, whether or not the user names helm-asc; NOT for generating,
  framing, or designing the images; encodes the staging layout, locale mapping,
  sandbox path rules, and dry-run-first upload procedure.
---

# App Store Screenshot Upload (helm-asc)

## Prerequisites

Load the `helm-asc` skill first. It resolves the CLI path, sets the `--agent` output
convention, and holds the general command map. This skill adds the screenshot-specific
detail that the general workflow does not cover.

## Staging layout

Stage every file as `<stage-root>/<locale>/<displayType>/NN_<filename>.<ext>`.

- Use the display type that matches the device set, for example `APP_IPHONE_67` for the
  6.9-inch set.
- The `NN_` prefix carries the display order. App Store Connect accepts up to 10
  screenshots and up to 3 previews per display type.
- When you export from a design tool, take `NN` from the `Display - N` token in the
  exported filename.

## Locale mapping

Map repository folder names to App Store Connect codes before you stage the files:

| Repository folder | App Store Connect locale |
| --- | --- |
| `de` | `de-DE` |
| `es` | `es-ES` |
| `nl` | `nl-NL` |

These folder names pass through unchanged: `da`, `el`, `fi`, `fr-CA`, `hi`, `hr`, `it`,
`pl`, `sv`, `tr`, `en-GB`.

## Sandbox paths

Helm runs in a sandbox, so the staging location decides whether the upload can read the
files at all.

1. Run `helm-asc paths --agent`.
2. Stage the tree under the returned `uploadsInbox`.
3. Verify the staged tree with `find` before you upload.

WARNING: writes into `~/Library/Group Containers/group.com.modumhq.Helm` need escalated
sandbox permission. Without that permission, a `mkdir` or `cp` loop can report success and
leave nothing behind. The failure then surfaces later as a helm-asc `FILE_ACCESS` error on
the upload command. Never treat a silent `cp` as proof that the files exist.

When an upload command returns `FILE_ACCESS`, list the staged tree with `find` before you
change anything. An empty or partial listing confirms that the staging write failed.
Re-stage the files with the escalated permission, verify the tree with `find`, and repeat
the dry run. `sudo` and `cd` do not change what the Helm sandbox can read, so do not use
them and do not remove `--dry-run` until the dry run counts every staged file. If `find`
lists the full tree, the files exist and Helm cannot read that path: ask the user to grant
access in Helm for that exact location, then repeat the dry run.

## Upload procedure

1. Run `helm-asc version <version-id> screenshots --agent` to record the current state.
2. Run `helm-asc version <version-id> screenshots upload --path <stage-root> --dry-run --agent`.
3. Read the `perGroup` entries in the dry-run output before you apply anything. Each
   entry covers one locale and display-type group. Compare each group's count with the
   number of files you staged for that group. If a count is lower, do not apply: with
   `--replace`, the upload leaves that group with only the counted files. Find the
   skipped files (check the `NN_` prefix, the extension, and the display-type folder),
   fix them, and repeat the dry run until every count matches.
4. Add `--replace` only when the user wants the new files to replace the existing set.
   `--replace` deletes every existing screenshot in each matching locale and display-type
   set before the upload. Without `--replace`, the upload adds to the existing set, up to
   the per-display-type limit. Do not add `--replace` for an "add" or "append" request.
   If the user proposes `--replace` for an addition, decline. State that `--replace`
   deletes the existing files in that set, and name each file.
5. Pass `--locale` once per approved locale, for example `--locale de-DE --locale nl-NL`.
   Without a locale list, the upload creates new store localisations with empty metadata
   for any extra folder in the staging tree.
6. Run the same command without `--dry-run` to apply.
7. A large upload (for example 85 screenshots, or a set of preview videos) runs for
   several minutes with no interim output. Wait for the command to return through the host's normal wait mechanism. Do not send
   input to the process and do not start a second upload.
8. Verify with `helm-asc version <version-id> screenshots --agent`.
9. Read the returned `items`. Each item carries `locale`, `displayType`, `fileName`,
   and `state`. Count the new export stamp in the `fileName` values, confirm that every
   `state` is `complete`, and confirm that only the locale and display-type groups you
   staged, within the `--locale` list, changed. For a replacement, also confirm that
   none of the old stamp remains. For an addition, also confirm that the existing files
   remain.
10. Remove the staging directory.

## Previews

Previews use the same staging layout, locale mapping, and sandbox rules, with two
differences. Preview display-type folders omit the `APP_` prefix: stage the 6.9-inch set
under `IPHONE_67`, not `APP_IPHONE_67`. Each display type accepts at most 3 previews, so
`NN_` runs from `01` to `03`. Substitute `previews` for `screenshots` in every command.

## Known non-failures

A locale that has a store localisation but no screenshots of its own falls back to the
primary locale. That is existing App Store behaviour, not an upload failure. When a user
reports that a locale outside the `--locale` list "did not take", tell the user that the
locale shows the primary locale's screenshots because it has none of its own, and that
this is App Store behaviour, not an upload failure. Then quote the last verification
result as the evidence: the states it returned, the stamps in its `fileName` values, and
whether any old stamp remained. If you have no verification result for that upload, run
step 8 before you answer. Do not re-run the upload for a locale that has no staged images.
To give that locale its own screenshots: export images for it, stage them under
`<locale>/<displayType>/`, get the user's approval to add the locale to the `--locale`
list, then dry-run before apply.
