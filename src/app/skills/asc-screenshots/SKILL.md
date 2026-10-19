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

Load the `helm-asc` skill first: it resolves the CLI path, sets the `--agent` output
convention, and holds the general command map. This skill adds the screenshot-specific detail.

## Staging layout

Stage every file as `<stage-root>/<locale>/<displayType>/NN_<filename>.<ext>`.

- Use the display type matching the device set, for example `APP_IPHONE_67` for the
  6.9-inch set.
- The `NN_` prefix carries the display order. App Store Connect accepts up to 10
  screenshots and up to 3 previews per display type.
- For design-tool exports, take `NN` from the `Display - N` token in the exported filename.

## Locale mapping

Map repository folder names to App Store Connect codes before staging:

| Repository folder | App Store Connect locale |
| --- | --- |
| `de` | `de-DE` |
| `es` | `es-ES` |
| `nl` | `nl-NL` |

These folder names pass through unchanged: `da`, `el`, `fi`, `fr-CA`, `hi`, `hr`, `it`,
`pl`, `sv`, `tr`, `en-GB`.

## Sandbox paths

Helm runs in a sandbox, so the staging location decides whether the upload can read the files.

1. Run `helm-asc paths --agent`.
2. Stage the tree under the returned `uploadsInbox`.
3. Verify the staged tree with `find` before uploading.

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
3. Before applying, read the `perGroup` entries in the dry-run output; each covers one
   locale and display-type group. Compare each group's count with the files you staged
   for it. If a count is lower, do not apply: with `--replace`, the upload leaves that
   group with only the counted files. Find the skipped files (check the `NN_` prefix, the
   extension, and the display-type folder), fix them, and repeat the dry run until every
   count matches.
4. Add `--replace` only when the user wants the new files to replace the existing set.
   `--replace` deletes every existing screenshot in each matching locale and display-type
   set before the upload; without it, the upload adds to the existing set, up to the
   per-display-type limit. Never add `--replace` for an "add" or "append" request. If the
   user proposes `--replace` for an addition, decline, state that it deletes the existing
   files in that set, and name each file.
5. Pass `--locale` once per approved locale, for example `--locale de-DE --locale nl-NL`.
   Without a locale list, the upload creates new store localisations with empty metadata
   for any extra folder in the staging tree.
6. Run the same command without `--dry-run` to apply.
7. A large upload (for example 85 screenshots, or a set of preview videos) runs for
   several minutes with no interim output. Wait for the command to return through the
   host's normal wait mechanism. Do not send input to the process or start a second upload.
8. Verify with `helm-asc version <version-id> screenshots --agent`.
9. Read the returned `items`; each carries `locale`, `displayType`, `fileName`, and
   `state`. Count the new export stamp in the `fileName` values, confirm every `state` is
   `complete`, and confirm only the locale and display-type groups you staged, within the
   `--locale` list, changed. For a replacement, confirm none of the old stamp remains; for
   an addition, confirm the existing files remain.
10. Remove the staging directory.

## Previews

Previews use the same staging layout, locale mapping, and sandbox rules, with two
differences:

- Preview display-type folders omit the `APP_` prefix: stage the 6.9-inch set under
  `IPHONE_67`, not `APP_IPHONE_67`. Each display type accepts at most 3 previews, so `NN_`
  runs from `01` to `03`.
- Substitute `previews` for `screenshots` in every command.

## Known non-failures

A locale with a store localisation but no screenshots of its own falls back to the
primary locale's screenshots. When a user reports that a locale outside the `--locale`
list "did not take":

1. Explain that the locale shows the primary locale's screenshots because it has none of
   its own, and that this is App Store behaviour, not an upload failure.
2. Quote the last verification result as evidence: the states it returned, the stamps in
   its `fileName` values, and whether any old stamp remained. Without a verification
   result for that upload, run step 8 before answering.
3. Do not re-run the upload for a locale with no staged images. To give that locale its
   own screenshots: export images for it, stage them under `<locale>/<displayType>/`, get
   the user's approval to add the locale to the `--locale` list, then dry-run before apply.
