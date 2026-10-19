---
name: app-store-keyword-ops
description: WHEN mining, auditing, or updating localized iOS App Store keywords with Astro competitor metrics; NOT for Android listings, release notes, or App Review submission; proposes only feature-relevant, locale-specific candidates with verified popularity and difficulty.
---

# App Store Keyword Ops

Astro MCP is the metric authority and competitor-keyword source. Use `app-store-scraper` and `aso` for listing context and product fit, and `helm-asc`, when available, for App Store Connect reads, writes, and export conventions. Resolve identifiers from the current repository and live services; remembered app IDs, versions, locales, and metadata are leads, not authority.

## 1. Resolve the target

1. Identify the app, bundle or App Store ID, storefronts, editable version, and requested locales from repository configuration and live App Store Connect state.
2. Map every target locale to the Astro storefronts its localization serves in scope, and query Astro for each mapped storefront. Never substitute evidence from a storefront outside that mapping.
3. Record whether each target localization exists and whether its keyword field is editable. If a localization does not exist, stop work for that locale and report it; do not create it.
4. Default an unspecified mutation request to an audit and dry run.

If the Astro MCP is unavailable or a locale cannot be queried, stop new-keyword selection for that locale and report the gap. Never replace Astro observations with estimates from web search or another tool.

**Complete when:** the app, version, target locales, Astro locale mapping, live editability, and requested write scope are explicit and current.

## 2. Capture the baseline

Read the exact title, subtitle, and keyword value for every target locale. A batch read may establish the matrix; if the batch is truncated, ambiguous, or missing any field, re-read every target locale individually and preserve explicit empty values.

For analysis, normalise keyword tokens by Unicode NFC, comma splitting, surrounding-whitespace removal, and locale-appropriate case folding; keep the source string separately. Audit:

- duplicate and empty tokens within each keyword field;
- overlap with that locale's title and subtitle;
- exact or translated overlap across locales, reported separately because storefront indexing can make it intentional;
- the UTF-8 byte count of each exact source value.

**Complete when:** every target locale has an exact source value and byte count, with all duplicate and overlap findings accounted for.

## 3. Mine and verify candidates

Build a feature contract from the app's implemented capabilities, audience, use cases, and current listing. For each locale independently:

1. Identify direct competitors in Astro whose functionality overlaps the feature contract.
2. Retrieve the keywords those competitors rank for in every storefront mapped to that locale.
3. Add relevant candidates from outside Astro, including product language, listing, reviews, or brainstorming.
4. Query every candidate, including those from outside Astro, through Astro in every mapped storefront. Astro measures only tracked keywords, so report every candidate you add to the app's tracked keyword set.
5. Keep a candidate only when all gates pass:

| Gate | Pass condition |
| --- | --- |
| Product fit | The localized term truthfully describes an implemented feature, function, use case, or audience need |
| Locale fit | The term is natural and relevant in the target locale, not a literal translation |
| Popularity | Astro popularity passes the project threshold or, when none exists, Astro's documented cutoff; low-popularity terms fail |
| Difficulty | Astro difficulty passes the project threshold or, when none exists, Astro's documented cutoff |
| Evidence | Observations are current, and the candidate passes popularity and difficulty in every storefront mapped to that locale |

Prefer repository-defined thresholds; otherwise use Astro's documented cutoffs: popularity greater than 25 and difficulty lower than 75. If the project rejects Astro's cutoffs and defines no replacement, show the values and obtain the user's cutoffs before recommending additions. Never treat an unmeasured candidate as worthwhile.

Rank passing candidates on the popularity/difficulty Pareto frontier, then by higher popularity and lower difficulty. Reject brand terms, competitor-only features, and keywords implying functionality the app lacks, whatever their metrics.

Show the evidence ledger before composing metadata:

| Locale | Storefront | Candidate | Source competitor or origin | Feature/function match | Astro popularity | Astro difficulty | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- |

**Complete when:** every target locale has been searched independently, every candidate has an Astro result for every mapped storefront, and every proposed addition passes all five gates; unmeasured and low-popularity candidates are excluded.

## 4. Compose exact values

- Produce stable, comma-separated tokens with no empty or duplicate entries.
- Reject any token of two characters or fewer: Apple requires each keyword to be greater than two characters.
- Remove same-locale title and subtitle overlap unless the evidence justifies keeping it. Review cross-locale overlap case by case rather than removing it mechanically.
- Count the final serialized value as UTF-8 bytes; the limit is 100 bytes, not 100 characters. When over the limit, drop the lowest-fit or weakest-evidence whole token; never truncate text.

Show this mutation ledger before any write:

| Locale | Current value (bytes) | Remove | Add | Proposed exact value (bytes) | Astro popularity/difficulty |
|---|---|---|---|---|---|

For a requested export, reuse the repository's existing schema and path, preferring `marketing/helm_keywords.csv` when that convention exists. Keep the exact proposed values and enough provenance to audit the change.

**Complete when:** every proposal is at most 100 UTF-8 bytes, every token is greater than two characters, every added token links to a passing Astro evidence row, every token and removal appears in the ledger, and each retained overlap has a rationale.

## 5. Dry-run and confirm

Render the exact app, version, locale, field, current value, proposed value, byte count, and mutation operation without invoking a write. Unless the user requested analysis only, end every dry run with one explicit confirmation question for that exact mutation set. Earlier broad permission does not approve values calculated later. Without confirmation, do not write.

**Complete when:** the exact mutation set is either explicitly approved after display or clearly left unapplied.

## 6. Apply and round-trip

After confirmation, write only the approved keyword fields for the approved version and locales. Leave review, release, and submission state unchanged: App Review submission is outside this skill's scope.

Re-read every written locale individually. Compare the returned value and UTF-8 byte count with the approved ledger, then report each locale as applied, unchanged, or failed with the observed reason.

**Complete when:** every approved locale round-trips exactly or has a named failure, and the App Review submission state is unchanged.
