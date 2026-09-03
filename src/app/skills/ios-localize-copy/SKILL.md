---
name: ios-localize-copy
description: WHEN translating, localizing, syncing, or validating user-facing iOS copy in `.xcstrings` String Catalogs, App Store release notes, or App Store screenshot caption copy; NOT for keyword optimization, screenshot image design or upload, binary upload, or App Review submission; preserves locale coverage and runtime text contracts, and encodes catalog extraction, format-specifier, and validation rules.
---

# iOS Localize Copy

Treat every localized string as a runtime contract.

## 1. Establish scope and locale truth

- Confirm whether the request is an edit, a review, or localized App Store metadata such as `whatsNew`, fastlane `release_notes.txt`, or screenshot caption copy. Keep metadata outside scope unless the user requests it. When you find stale metadata, do not edit it. Name it in the handoff as a separate task.
- Inspect Xcode `knownRegions`, every relevant `.xcstrings` catalog, and App Store metadata locale directories or configuration. Record each locale set. Resolve mismatches from project evidence before you translate. When project evidence does not resolve a mismatch, ask the user to classify the locale before you translate.
- Inspect repository guidance, the current diff, and existing localization validators. Preserve unrelated work.
- Audit before you edit. Load each catalog as JSON. Report keys against locales, the state counts (`translated`, `new`, `needs_review`), and the exact list of missing keys for each locale.

Complete when every discovered locale is classified as supported or excluded with evidence, the permitted files are explicit, and the audit table exists.

## 2. Build the copy inventory

- Derive the target keys from the request and current diff.
- Trace each key or source literal to its call sites. Read the surrounding UI, comments, tests, and screenshots needed to identify audience, action, feature terminology, length constraints, plural rules, and tone.
- Record the catalog's declared source-language value, key, visible context, placeholders, URLs, Markdown link targets, and intentional whitespace for every target.

When an expected key is absent from the catalog, check these extraction rules before you add the key by hand:

- A string extracts into the catalog named by its `table:` or `tableName:` argument. With no table argument it extracts into `Localizable.xcstrings`. A custom catalog name whose call sites pass no table name is the usual reason a catalog stays empty after a build.
- The catalog file must have target membership. The target must set `SWIFT_EMIT_LOC_STRINGS = YES` for compiler extraction of APIs such as `String(localized:)`. A SwiftUI `Text` literal also extracts through `LOCALIZED_STRING_SWIFTUI_SUPPORT`, which defaults to `YES`, so check both settings before you blame the catalog.
- Xcode never extracts a string that reaches the API through a plain `String` variable. Keep the literal inside a localizable API call, such as `Text("...")`, `String(localized: "...")`, or `LocalizedStringResource("...")`. A `LocalizedStringResource` value may then be stored and passed on.
- A build emits `.stringsdata`; `xcstringstool sync` merges those keys into the catalog. Build the owning target. Locate only its emitted data with `find <DerivedData> -path '*/<Target>.build/*' -name '*.stringsdata'`. Back up the catalog. Then run `xcrun xcstringstool sync <catalog> --stringsdata <file> --skip-marking-strings-stale`. Use default stale deletion only when removal is explicitly in scope. Inspect the structural diff before you accept the sync.

Complete when every target key has a declared source-language baseline, a verified UI meaning, and a runtime-contract signature.

## 3. Localize in context

Do not attempt these two routes. Both cost time and return nothing:

- Xcode's "Generate Translations" command cannot be driven reliably through GUI automation.
- The on-device Translation framework CLI blocks on a model-download prompt that a headless process cannot answer.

Then localize:

- Build a glossary from the strings already translated in the catalog, so new work reuses the shipped term for each concept instead of inventing synonyms. Keep one glossary for each locale for product domain terms, so machine output does not leave English terms embedded.
- Check every candidate value, including one the user supplies, against the glossary. Use the shipped term when the candidate is a synonym of it.
- Translate every target key for every supported locale using native, context-appropriate iOS and product terminology.
- Preserve placeholder types and order, Markdown and plain URL targets, escaped characters, intentional line breaks and surrounding whitespace, source-key alignment, and variations. Preserve the catalog state of every entry you do not change. Update the state only for an entry whose value you change, or whose current value you have explicitly reviewed.
- A translation may reorder arguments only with positional markers, such as `%1$@` and `%2$lld`. Each marker must match the conversion type of the source argument it points at. A bare `%@` may not be reordered.
- Keep the catalog's declared source language authoritative. Change call sites only when required to connect the approved copy correctly, and leave unrelated catalog entries untouched.
- Copy the catalog to a backup outside the repository tree. Then merge each value in place. A `json.dumps` round-trip is not byte-identical to Xcode's formatting, so never rewrite the file wholesale, whatever the number of missing values.

Complete when the copy inventory has one context-correct value for every target-key and supported-locale pair.

## 4. Validate contracts

- Parse each modified catalog with the repository's existing validator or the smallest available JSON/plist parser.
- Compare key and locale coverage against the inventory.
- Compare each translation's placeholder signature and order, URL and Markdown-link targets, intentional whitespace, variations, and source-key mapping with the declared source language.
- Inspect the structural diff for unrelated keys, locale removal, or extraction-state changes. Run the narrowest relevant build or localization tests when available.
- Re-audit each merged catalog. Report zero missing target keys for each supported locale. List pre-existing gaps in unrelated keys separately, and do not edit them. Clear the `needs_review` states that the merge supersedes.

Run this gate on every modified catalog before you hand back:

1. `jq empty <catalog>` to prove the JSON is valid.
2. A key count for each locale.
3. A placeholder-equivalence diff between the source string and each translation: count, conversion type, and argument mapping.
4. `xcrun xcstringstool compile <catalog> --output-directory <tmp>` into a temporary directory. `--dry-run` only lists the output paths it would produce, so it does not prove that the catalog compiles.
5. `git diff --check`.

Complete when all modified catalogs parse, every supported locale covers every target key, every runtime signature matches, and all gate steps and relevant checks pass.

## 5. Run a fresh language review

- Give an independent agent only the declared source-language value, localized values, locale, and verified UI context. Ask it to check meaning, grammar, naturalness, terminology, placeholders, URLs, and contextual fit for every changed value.
- If an independent agent is unavailable, begin a clean review pass from the inventory rather than the drafting rationale.
- Resolve each concrete finding or report it as an explicit unresolved risk.

Complete when every changed locale has a fresh-context verdict and no unexplained finding remains.

## 6. Hand off the scoped result

- Re-read the final diff. Report changed keys, locale coverage, contract checks, language-review outcome, and remaining uncertainty.
- When publishing is requested, stage only the explicit catalog, call-site, and requested metadata paths.
- For requested App Store `whatsNew` or screenshot caption copy, keep each locale grounded in shipped user-facing changes. Validate the metadata files separately. Hand off screenshot image design and upload as separate tasks.
- Stop before binary upload or App Review submission. State that boundary in the handoff.

Complete when the handoff names the exact files and checks, and the staged set matches the approved scope.
