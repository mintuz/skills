---
name: ios-localize-copy
description: WHEN translating, localizing, syncing, or validating user-facing iOS copy in `.xcstrings` String Catalogs, App Store release notes, or App Store screenshot caption copy; NOT for keyword optimization, screenshot image design or upload, binary upload, or App Review submission; preserves locale coverage and runtime text contracts, and encodes catalog extraction, format-specifier, and validation rules.
---

# iOS Localize Copy

Treat every localized string as a runtime contract.

## 1. Establish scope and locale truth

- Classify the request as an edit, a review, or localized App Store metadata (`whatsNew`, fastlane `release_notes.txt`, or screenshot caption copy). Keep metadata out of scope unless the user requests it; never edit stale metadata, and name it in the handoff as a separate task.
- Inspect Xcode `knownRegions`, every relevant `.xcstrings` catalog, and App Store metadata locale directories or configuration, and record each locale set. Resolve mismatches from project evidence before translating; where evidence does not resolve a mismatch, ask the user to classify the locale before translating.
- Inspect repository guidance, the current diff, and existing localization validators. Preserve unrelated work.
- Audit before editing: load each catalog as JSON and report keys against locales, the state counts (`translated`, `new`, `needs_review`), and the exact missing-key list for each locale.

Complete when every discovered locale is classified as supported or excluded with evidence, the permitted files are explicit, and the audit table exists.

## 2. Build the copy inventory

- Derive the target keys from the request and current diff.
- Trace each key or source literal to its call sites. Read the surrounding UI, comments, tests, and screenshots needed to identify audience, action, feature terminology, length constraints, plural rules, and tone.
- For every target, record the catalog's declared source-language value, key, visible context, placeholders, URLs, Markdown link targets, and intentional whitespace.

When an expected key is absent from the catalog, check these extraction rules before adding the key by hand:

- A string extracts into the catalog named by its `table:` or `tableName:` argument, or into `Localizable.xcstrings` without one. A custom catalog name whose call sites pass no table name is the usual reason a catalog stays empty after a build.
- The catalog file needs target membership. Compiler extraction of APIs such as `String(localized:)` needs `SWIFT_EMIT_LOC_STRINGS = YES` on the target. A SwiftUI `Text` literal also extracts through `LOCALIZED_STRING_SWIFTUI_SUPPORT` (default `YES`), so check both settings before blaming the catalog.
- Xcode never extracts a string that reaches the API through a plain `String` variable. Keep the literal inside a localizable API call, such as `Text("...")`, `String(localized: "...")`, or `LocalizedStringResource("...")`; a `LocalizedStringResource` value may then be stored and passed on.
- A build emits `.stringsdata`, and `xcstringstool sync` merges those keys into the catalog:
  1. Build the owning target.
  2. Locate only its emitted data with `find <DerivedData> -path '*/<Target>.build/*' -name '*.stringsdata'`.
  3. Back up the catalog.
  4. Run `xcrun xcstringstool sync <catalog> --stringsdata <file> --skip-marking-strings-stale`. Use default stale deletion only when removal is explicitly in scope.
  5. Inspect the structural diff before accepting the sync.

Complete when every target key has a declared source-language baseline, a verified UI meaning, and a runtime-contract signature.

## 3. Localize in context

Skip these two routes; both cost time and return nothing:

- Xcode's "Generate Translations" command cannot be driven reliably through GUI automation.
- The on-device Translation framework CLI blocks on a model-download prompt that a headless process cannot answer.

Then localize:

- Build a glossary from the catalog's existing translations so new work reuses the shipped term for each concept instead of inventing synonyms. Keep one glossary per locale for product domain terms, so machine output leaves no English terms embedded.
- Check every candidate value, including user-supplied ones, against the glossary; where the candidate is a synonym of a shipped term, use the shipped term.
- Translate every target key for every supported locale using native, context-appropriate iOS and product terminology.
- Preserve placeholder types and order, Markdown and plain URL targets, escaped characters, intentional line breaks and surrounding whitespace, source-key alignment, and variations. Preserve the catalog state of every entry you do not change; update the state only for an entry whose value you change or whose current value you have explicitly reviewed.
- Reorder arguments only with positional markers, such as `%1$@` and `%2$lld`, each matching the conversion type of the source argument it points at. Never reorder a bare `%@`.
- Keep the catalog's declared source language authoritative. Change call sites only when required to connect the approved copy, and leave unrelated catalog entries untouched.
- Copy the catalog to a backup outside the repository tree, then merge each value in place. A `json.dumps` round-trip is not byte-identical to Xcode's formatting, so never rewrite the file wholesale, however many values are missing.

Complete when the copy inventory has one context-correct value for every target-key and supported-locale pair.

## 4. Validate contracts

- Parse each modified catalog with the repository's existing validator or the smallest available JSON/plist parser.
- Compare key and locale coverage against the inventory.
- Compare each translation's placeholder signature and order, URL and Markdown-link targets, intentional whitespace, variations, and source-key mapping with the declared source language.
- Inspect the structural diff for unrelated keys, locale removal, or extraction-state changes. Run the narrowest relevant build or localization tests when available.
- Re-audit each merged catalog and report zero missing target keys for each supported locale. List pre-existing gaps in unrelated keys separately without editing them. Clear the `needs_review` states the merge supersedes.

Before handing back, run this gate on every modified catalog:

1. `jq empty <catalog>` to prove the JSON is valid.
2. A key count for each locale.
3. A placeholder-equivalence diff between the source string and each translation: count, conversion type, and argument mapping.
4. `xcrun xcstringstool compile <catalog> --output-directory <tmp>` into a temporary directory. `--dry-run` only lists the output paths it would produce, so it does not prove the catalog compiles.
5. `git diff --check`.

Complete when all modified catalogs parse, every supported locale covers every target key, every runtime signature matches, and all gate steps and relevant checks pass.

## 5. Run a fresh language review

- Give an independent agent only the declared source-language value, localized values, locale, and verified UI context. Ask it to check meaning, grammar, naturalness, terminology, placeholders, URLs, and contextual fit for every changed value.
- Without an independent agent, begin a clean review pass from the inventory, not the drafting rationale.
- Resolve each concrete finding or report it as an explicit unresolved risk.

Complete when every changed locale has a fresh-context verdict and no unexplained finding remains.

## 6. Hand off the scoped result

- Re-read the final diff. Report changed keys, locale coverage, contract checks, language-review outcome, and remaining uncertainty.
- When publishing is requested, stage only the explicit catalog, call-site, and requested metadata paths.
- For requested App Store `whatsNew` or screenshot caption copy, ground each locale in shipped user-facing changes and validate the metadata files separately. Hand off screenshot image design and upload as separate tasks.
- Stop before binary upload or App Review submission, and state that boundary in the handoff.

Complete when the handoff names the exact files and checks, and the staged set matches the approved scope.
