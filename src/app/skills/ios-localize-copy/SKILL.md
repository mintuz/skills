---
name: ios-localize-copy
description: WHEN localizing, syncing, or validating user-facing iOS copy in `.xcstrings` String Catalogs or App Store release notes; NOT for keyword optimization, binary upload, or App Review submission; preserves locale coverage and runtime text contracts, and encodes catalog extraction, format-specifier, and validation rules.
---

# iOS Localize Copy

Treat every localized string as a runtime contract.

## 1. Establish scope and locale truth

- Confirm whether the request is an edit, a review, or localized App Store `whatsNew` copy. Keep `whatsNew` outside scope unless the user requests it.
- Inspect Xcode `knownRegions`, every relevant `.xcstrings` catalog, and App Store metadata locale directories or configuration. Record each locale set and resolve mismatches from project evidence before translating.
- Inspect repository guidance, the current diff, and existing localization validators. Preserve unrelated work.
- Audit before you edit. Load each catalog as JSON and report keys against locales, the state counts (`translated`, `new`, `needs_review`), and the exact list of missing keys for each locale.

Complete when every discovered locale is classified as supported or excluded with evidence, the permitted files are explicit, and the audit table exists.

## 2. Build the copy inventory

- Derive the target keys from the request and current diff.
- Trace each key or source literal to its call sites. Read the surrounding UI, comments, tests, and screenshots needed to identify audience, action, feature terminology, length constraints, plural rules, and tone.
- Record the catalog's declared source-language value, key, visible context, placeholders, URLs, Markdown link targets, and intentional whitespace for every target.

When an expected key is absent from the catalog, check these extraction rules before you add the key by hand:

- The catalog must be named `Localizable.xcstrings` unless every call site passes `table:` or `tableName:`. A custom catalog name is the usual reason a catalog stays empty after a build.
- The catalog file must have target membership, and the target must set `SWIFT_EMIT_LOC_STRINGS = YES`.
- Xcode never extracts a string that reaches the API through a plain `String` variable. Move the literal to the call site.
- A build emits `.stringsdata`; `xcstringstool sync` merges those keys into the catalog. Build the owning target, locate only its emitted data, back up the catalog, then run `xcrun xcstringstool sync <catalog> --stringsdata <file> --skip-marking-strings-stale`. Use default stale deletion only when removal is explicitly in scope, and inspect the structural diff before accepting the sync.

Complete when every target key has a declared source-language baseline, a verified UI meaning, and a runtime-contract signature.

## 3. Localize in context

Do not attempt these two routes. Both cost time and return nothing:

- Xcode's "Generate Translations" command cannot be driven reliably through GUI automation.
- The on-device Translation framework CLI blocks on a model-download prompt that a headless process cannot answer.

Then localize:

- Build a glossary from the strings already translated in the catalog, so new work reuses the shipped term for each concept instead of inventing synonyms. Keep one glossary for each locale for product domain terms, so machine output does not leave English terms embedded.
- Translate every target key for every supported locale using native, context-appropriate iOS and product terminology.
- Preserve placeholder types and order, Markdown and plain URL targets, escaped characters, intentional line breaks and surrounding whitespace, source-key alignment, variations, and catalog state.
- A translation may reorder arguments only with positional markers, such as `%1$@` and `%2$lld`. Each marker must match the conversion type of the source argument it points at. A bare `%@` may not be reordered.
- Keep the catalog's declared source language authoritative. Change call sites only when required to connect the approved copy correctly, and leave unrelated catalog entries untouched.
- Copy the catalog to a backup, then merge each value in place. A `json.dumps` round-trip is not byte-identical to Xcode's formatting, so never rewrite the file wholesale.

Complete when the copy inventory has one context-correct value for every target-key and supported-locale pair.

## 4. Validate contracts

- Parse each modified catalog with the repository's existing validator or the smallest available JSON/plist parser.
- Compare key and locale coverage against the inventory.
- Compare each translation's placeholder signature and order, URL and Markdown-link targets, intentional whitespace, variations, and source-key mapping with the declared source language.
- Inspect the structural diff for unrelated keys, locale removal, or extraction-state changes; run the narrowest relevant build or localization tests when available.
- Re-audit each merged catalog. Report zero missing keys for each locale, and clear the `needs_review` states that the merge supersedes.

Run this gate on every modified catalog before you hand back:

1. `jq empty <catalog>` to prove the JSON is valid.
2. A key count for each locale.
3. A placeholder-equivalence diff between the source string and each translation.
4. `xcstringstool compile --output-directory <tmp> --dry-run`.
5. `git diff --check`.

Complete when all modified catalogs parse, every supported locale covers every target key, every runtime signature matches, and all gate steps and relevant checks pass.

## 5. Run a fresh language review

- Give an independent agent only the declared source-language value, localized values, locale, and verified UI context. Ask it to check meaning, grammar, naturalness, terminology, placeholders, URLs, and contextual fit for every changed value.
- If an independent agent is unavailable, begin a clean review pass from the inventory rather than the drafting rationale.
- Resolve each concrete finding or report it as an explicit unresolved risk.

Complete when every changed locale has a fresh-context verdict and no unexplained finding remains.

## 6. Hand off the scoped result

- Re-read the final diff and report changed keys, locale coverage, contract checks, language-review outcome, and remaining uncertainty.
- When publishing is requested, stage only the explicit catalog, call-site, and requested metadata paths.
- For requested App Store `whatsNew`, keep each locale grounded in shipped user-facing changes and validate the metadata files separately.
- Stop before binary upload or App Review submission and state that boundary in the handoff.

Complete when the handoff names the exact files and checks, and the staged set matches the approved scope.
