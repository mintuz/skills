---
name: asc-screenshots
description: >
  WHEN uploading or replacing App Store screenshots or previews through helm-asc;
  NOT for generating, framing, or designing the images; encodes the staging layout,
  locale mapping, sandbox path rules, and dry-run-first upload procedure.
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
- The `NN_` prefix (01–05) carries the display order.
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

## Upload procedure

1. Run `helm-asc version <version-id> screenshots --agent` to record the current state.
2. Run `helm-asc version <version-id> screenshots upload --path <stage-root> --dry-run --agent`.
3. Read the `perGroup` counts in the dry-run output before you apply anything.
4. If a target locale already holds screenshots, add `--replace`.
5. Pass an explicit `--locale` list. Without a locale list, the upload creates new store
   localisations with empty metadata for any extra folder in the staging tree.
6. Run the same command without `--dry-run` to apply.
7. A large upload (for example 85 images) runs for several minutes with no interim output.
   Wait for the command to return. Do not re-issue the command and do not poll stdin.
8. Verify with `helm-asc version <version-id> screenshots --agent`.
9. Count the new export stamp in the returned `fileNames`, confirm that none of the old
   stamp remains, and confirm that every state is `complete`.
10. Remove the staging directory.

## Previews

Previews use the same staging layout, locale mapping, and sandbox rules. Substitute
`previews` for `screenshots` in every command.

## Known non-failures

A locale that has a store localisation but no screenshots of its own falls back to the
primary locale. That is existing App Store behaviour, not an upload failure.
