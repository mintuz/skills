---
name: ios-localize-copy
description: WHEN localizing or reviewing user-facing iOS copy in String Catalogs or App Store release notes; NOT for keyword optimization, binary upload, or App Review submission; preserves locale coverage and runtime text contracts.
---

# iOS Localize Copy

Treat every localized string as a runtime contract.

## 1. Establish scope and locale truth

- Confirm whether the request is an edit, a review, or localized App Store `whatsNew` copy. Keep `whatsNew` outside scope unless the user requests it.
- Inspect Xcode `knownRegions`, every relevant `.xcstrings` catalog, and App Store metadata locale directories or configuration. Record each locale set and resolve mismatches from project evidence before translating.
- Inspect repository guidance, the current diff, and existing localization validators. Preserve unrelated work.

Complete when every discovered locale is classified as supported or excluded with evidence, and the permitted files are explicit.

## 2. Build the copy inventory

- Derive the target keys from the request and current diff.
- Trace each key or source literal to its call sites. Read the surrounding UI, comments, tests, and screenshots needed to identify audience, action, feature terminology, length constraints, plural rules, and tone.
- Record the English source, key, visible context, placeholders, URLs, Markdown link targets, and intentional whitespace for every target.

Complete when every target key has an English baseline, a verified UI meaning, and a runtime-contract signature.

## 3. Localize in context

- Translate every target key for every supported locale using native, context-appropriate iOS and product terminology.
- Preserve placeholder types and order, Markdown and plain URL targets, escaped characters, intentional line breaks and surrounding whitespace, source-key alignment, variations, and catalog state.
- Keep the English source authoritative. Change call sites only when required to connect the approved copy correctly, and leave unrelated catalog entries untouched.

Complete when the copy inventory has one context-correct value for every target-key and supported-locale pair.

## 4. Validate contracts

- Parse each modified catalog with the repository's existing validator or the smallest available JSON/plist parser.
- Compare key and locale coverage against the inventory.
- Compare each translation's placeholder signature and order, URL and Markdown-link targets, intentional whitespace, variations, and source-key mapping with English.
- Inspect the structural diff for unrelated keys, locale removal, or extraction-state changes; run the narrowest relevant build or localization tests when available.

Complete when all modified catalogs parse, every supported locale covers every target key, every runtime signature matches, and relevant checks pass.

## 5. Run a fresh language review

- Give an independent agent only the English source, localized values, locale, and verified UI context. Ask it to check meaning, grammar, naturalness, terminology, placeholders, URLs, and contextual fit for every changed value.
- If an independent agent is unavailable, begin a clean review pass from the inventory rather than the drafting rationale.
- Resolve each concrete finding or report it as an explicit unresolved risk.

Complete when every changed locale has a fresh-context verdict and no unexplained finding remains.

## 6. Hand off the scoped result

- Re-read the final diff and report changed keys, locale coverage, contract checks, language-review outcome, and remaining uncertainty.
- When publishing is requested, stage only the explicit catalog, call-site, and requested metadata paths.
- For requested App Store `whatsNew`, keep each locale grounded in shipped user-facing changes and validate the metadata files separately.
- Stop before binary upload or App Review submission and state that boundary in the handoff.

Complete when the handoff names the exact files and checks, and the staged set matches the approved scope.
