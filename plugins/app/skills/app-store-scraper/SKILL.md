---
name: app-store-scraper
description: >
  WHEN retrieving public iOS/macOS App Store metadata, search results, charts, developer portfolios, reviews, ratings, suggestions, or similar-app candidates;
  NOT for App Store Connect analytics, authenticated owner data, or installing/testing apps;
  routes each storefront-scoped request through the matching Apple endpoint and returns validated structured data
---

# App Store Scraper

Treat each retrieval as a **query contract**: one data branch, explicit identifiers and storefronts, a bounded result set, and a schema check before analysis.

## 1. Lock the query contract

Extract:

- branch: metadata, search, chart, developer portfolio, reviews, ratings, suggestions, or similar apps;
- identifier: numeric app ID, bundle ID, developer ID, or search term;
- platform: iOS/iPadOS or macOS when it changes the entity;
- storefront: two-letter country code for every regional result;
- coverage: result limit, pages, apps, countries, and sort order;
- output: requested fields, format, grouping, and derived comparisons.

Default an omitted storefront to `us`, a list/search limit to the endpoint's default, and reviews to page 1 sorted by most recent. Ask for a missing identifier or any choice that materially changes the query.

**Complete when:** every requested output field and comparison maps to an identifier, storefront, branch, and finite coverage bound.

## 2. Route each branch

| Request | Reference | Source class |
| --- | --- | --- |
| App metadata by app ID or bundle ID; bulk app lookup | [App lookup](endpoints/app-lookup.md) | Documented Search API |
| Keyword discovery and filtering | [Search](endpoints/search.md) | Documented Search API |
| Apps returned for a developer ID | [Developer portfolio](endpoints/developer.md) | Documented Lookup API |
| Top free, top paid, top grossing, new, or category charts | [Charts](endpoints/lists.md) | Apple RSS feed; legacy fallback for unsupported charts |
| Public written reviews | [Reviews](endpoints/reviews.md) | Undocumented RSS endpoint |
| One-to-five-star distribution | [Ratings](endpoints/ratings.md) | Undocumented storefront endpoint |
| App Store query completions | [Suggestions](endpoints/suggestions.md) | Undocumented plist endpoint |
| Related-app candidates | [Similar apps](endpoints/similar.md) | API proxy or authorized HTML heuristic |

Read the selected reference completely before constructing its request. Also read App lookup when the selected branch needs ID resolution or metadata enrichment. For a request spanning branches, keep one query contract per branch and join records by `trackId` or `artistId`.

**Complete when:** each contract has one primary endpoint, its source class is explicit, and every required disclosed reference has been read.

## 3. Execute defensively

Use `curl --fail-with-body --silent --show-error --location`. Keep user-supplied values in quoted `--data-urlencode` arguments. Parse JSON with `jq`; convert the suggestions plist with macOS `plutil` before using `jq`.

For documented Search and Lookup requests, follow Apple's [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/) contract. Its archived documentation specifies approximately 20 calls per minute, subject to change, and recommends caching for large sites. Serialize multi-call runs within that bound; honor `Retry-After` on `429`, and retry only transient transport or `5xx` failures.

Treat RSS, ratings, and suggestions schemas as volatile. Validate the root type and required fields before selecting values. Treat an empty result as data only after the payload passes its branch schema; otherwise report the response as an endpoint failure.

The HTML branch requires an authorized basis and compliance with the applicable site terms. Apple's [Website Terms of Use](https://www.apple.com/legal/internet-services/terms/site.html) prohibit page scraping; use the API proxies in Similar apps unless the user supplies a separate authorized basis.

**Complete when:** every requested app, storefront, and page has either a schema-valid response or an explicit failure with its HTTP or parsing evidence.

## 4. Verify coverage and return

Before analysis:

- confirm returned app, developer, and storefront identifiers match the contract;
- preserve provider order for search and chart rankings;
- join bulk results by identifier rather than response position;
- distinguish zero results, missing regional availability, truncated coverage, and endpoint failure;
- label values inferred from an undocumented schema or HTML heuristic;
- account for every requested app, country, page, field, and comparison.

Return the requested shape plus the storefront, retrieval time, source class, and any truncation, unavailable data, or failed branch. Include raw payloads only when requested.

**Complete when:** every requested unit is accounted for, every reported value traces to a validated response field, and every limitation is attached to the affected result.
