---
name: app-store-scraper
description: >
  WHEN scraping iOS/macOS App Store data (apps, reviews, ratings, search);
  NOT for installing or testing apps; retrieves structured JSON data using iTunes/App Store APIs with curl and jq formatting
---

# App Store Scraper

Comprehensive toolkit for retrieving structured data from Apple's App Store and iTunes APIs using curl and jq. The API endpoints return JSON that can be parsed and formatted for analysis. The similar-apps page returns HTML.

## Quick Start

**Tools Required:**
- `curl` for HTTP requests
- `jq` for JSON parsing and formatting

**Example (field selection only; scripts must run the Retrieval Validation gates first):**
```bash
# Get app details
curl -fsS "https://itunes.apple.com/lookup?id=553834731&entity=software" | \
  jq '.results[0] | {name: .trackName, rating: .averageUserRating}'
```

## Decision Trees

Use these decision trees to quickly find the right endpoint for your needs.

### 🎯 Decision Tree 1: What Data Do You Need?

```
What information do you need?
│
├─ App Metadata (name, price, developer, description)
│  ├─ I know the app ID → [App Lookup](endpoints/app-lookup.md)
│  ├─ I know the bundle ID → [App Lookup](endpoints/app-lookup.md)
│  └─ I need to search by keyword → [App Search](endpoints/search.md)
│
├─ App Discovery
│  ├─ Browse top apps or categories → [App Lists/Feeds](endpoints/lists.md)
│  ├─ Search by keyword → [App Search](endpoints/search.md)
│  ├─ Find all apps by a developer → [Developer Apps](endpoints/developer.md)
│  ├─ Get search suggestions → [Search Suggestions](endpoints/suggestions.md)
│  └─ Find similar apps → [Similar Apps](endpoints/similar.md)
│
└─ User Feedback
   ├─ Read user reviews → [Reviews](endpoints/reviews.md)
   └─ Get rating distribution (1-5 stars) → [Ratings Histogram](endpoints/ratings.md)
```

### 🔍 Decision Tree 2: How Do You Identify the App?

```
How do you identify the app?
│
├─ I have the numeric app ID (e.g., 553834731)
│  ├─ Get app details → [App Lookup](endpoints/app-lookup.md)
│  ├─ Get reviews → [Reviews](endpoints/reviews.md)
│  ├─ Get ratings breakdown → [Ratings Histogram](endpoints/ratings.md)
│  └─ Find similar apps → [Similar Apps](endpoints/similar.md)
│
├─ I have the bundle ID (e.g., com.apple.Numbers)
│  └─ Get app details → [App Lookup](endpoints/app-lookup.md)
│
├─ I have the developer ID
│  └─ Get all apps by developer → [Developer Apps](endpoints/developer.md)
│
├─ I only know the app name
│  └─ Search by keyword → [App Search](endpoints/search.md)
│
└─ I want to explore
   ├─ Browse by category → [App Lists/Feeds](endpoints/lists.md)
   └─ Get search suggestions → [Search Suggestions](endpoints/suggestions.md)
```

### 📊 Decision Tree 3: What Action Do You Want to Perform?

```
What do you want to do?
│
├─ Analyze a Specific App
│  ├─ Get comprehensive metadata → [App Lookup](endpoints/app-lookup.md)
│  ├─ Read user feedback → [Reviews](endpoints/reviews.md)
│  ├─ Analyze rating distribution → [Ratings Histogram](endpoints/ratings.md)
│  └─ Find competitors/alternatives → [Similar Apps](endpoints/similar.md)
│
├─ Market Research
│  ├─ Track top apps in categories → [App Lists/Feeds](endpoints/lists.md)
│  ├─ Analyze developer portfolios → [Developer Apps](endpoints/developer.md)
│  └─ Search by keyword/category → [App Search](endpoints/search.md)
│
└─ Monitor Changes
   ├─ Track rating changes → [Ratings Histogram](endpoints/ratings.md)
   ├─ Monitor new reviews → [Reviews](endpoints/reviews.md)
   └─ Watch top charts → [App Lists/Feeds](endpoints/lists.md)
```

### 🌍 Decision Tree 4: Regional & Multi-App Queries

```
Do you need region-specific or multi-app data?
│
├─ Multi-Region Analysis
│  ├─ Compare ratings across regions → [Ratings Histogram](endpoints/ratings.md)
│  └─ Get reviews from different regions → [Reviews](endpoints/reviews.md)
│
├─ Bulk Operations
│  ├─ Lookup multiple apps → [App Lookup](endpoints/app-lookup.md)
│  └─ Search and filter results → [App Search](endpoints/search.md)
│
└─ Category Browsing
   └─ Browse by specific categories → [App Lists/Feeds](endpoints/lists.md)
```

## 📚 Documentation Index

### Endpoints (API-Based)

Reliable, structured API endpoints that return JSON:

| Endpoint | Description | File |
|----------|-------------|------|
| **App Lookup** | Get detailed app info by ID or bundle ID | [endpoints/app-lookup.md](endpoints/app-lookup.md) |
| **App Search** | Search apps by keyword with filters | [endpoints/search.md](endpoints/search.md) |
| **App Lists/Feeds** | Browse top apps and categories | [endpoints/lists.md](endpoints/lists.md) |
| **Developer Apps** | Get all apps by a specific developer | [endpoints/developer.md](endpoints/developer.md) |
| **Reviews** | Fetch paginated user reviews | [endpoints/reviews.md](endpoints/reviews.md) |
| **Ratings Histogram** | Get 1-5 star rating breakdown | [endpoints/ratings.md](endpoints/ratings.md) |
| **Search Suggestions** | Get autocomplete search hints | [endpoints/suggestions.md](endpoints/suggestions.md) |

### Endpoints (Web Scraping)

Requires HTML parsing, less reliable:

| Endpoint | Description | File |
|----------|-------------|------|
| **Similar Apps** | Read the "You Might Also Like" section only; label category/developer discovery as proxies | [endpoints/similar.md](endpoints/similar.md) |

## Common Use Cases

### Use Case 1: Competitive Analysis

```bash
# 1. Search for competitor apps
curl -s "https://itunes.apple.com/search?term=note%20taking&media=software&entity=software&limit=10"

# 2. Get detailed info for top results
# 3. Compare ratings, features, pricing
# 4. Analyze user reviews

See: [App Search](endpoints/search.md) → [App Lookup](endpoints/app-lookup.md) → [Reviews](endpoints/reviews.md)
```

### Use Case 2: App Monitoring

```bash
# 1. Get current app state
# 2. Track rating changes over time
# 3. Monitor new reviews
# 4. Alert on rating drops

See: [App Lookup](endpoints/app-lookup.md) → [Ratings Histogram](endpoints/ratings.md) → [Reviews](endpoints/reviews.md)
```

### Use Case 3: Market Research

```bash
# 1. Browse top apps in category
# 2. Analyze pricing trends
# 3. Study feature patterns
# 4. Identify gaps in market

See: [App Lists/Feeds](endpoints/lists.md) → [App Search](endpoints/search.md)
```

### Use Case 4: Developer Portfolio Analysis

```bash
# 1. Find developer ID from an app
# 2. Get all apps by developer
# 3. Compare performance across portfolio
# 4. Track developer strategy

See: [App Lookup](endpoints/app-lookup.md) → [Developer Apps](endpoints/developer.md)
```

## Quick Reference

### Essential Parameters

- **country** - Market code (default: `us`)
- **entity** - `software` for iOS apps, `macSoftware` for macOS apps; the result's `kind` is `software` or `mac-software`. The endpoint examples target iOS. For a macOS app, substitute `entity=macSoftware` and check `kind == "mac-software"`
- **limit** - Max results (varies by endpoint)
- **lang** - Language preference (e.g., `en-US`, `ja-JP`)

### Common Country Codes

| Code | Country | Code | Country |
|------|---------|------|---------|
| `us` | United States | `gb` | United Kingdom |
| `de` | Germany | `fr` | France |
| `jp` | Japan | `au` | Australia |
| `ca` | Canada | `es` | Spain |
| `it` | Italy | `br` | Brazil |
| `in` | India | `mx` | Mexico |
| `kr` | South Korea | `cn` | China |

### Common Commands

Field-selection shortcuts. In a script, run the Retrieval Validation gates first (Best Practice 1).

```bash
# Get app by ID
curl -s "https://itunes.apple.com/lookup?id=553834731&entity=software" | jq '.results[0]'

# Search apps
curl -s "https://itunes.apple.com/search?term=weather&media=software&entity=software&limit=10"

# Top free apps
curl -s "https://itunes.apple.com/us/rss/topfreeapplications/limit=25/json"

# Recent reviews
curl -s "https://itunes.apple.com/us/rss/customerreviews/page=1/id=553834731/sortby=mostrecent/json"
```

## Best Practices

1. **Validate responses** before you extract fields. For every endpoint: transport (`curl -fsS`). For every JSON endpoint: exactly one JSON object (`jq -es 'length == 1 and (.[0] | type == "object")'`); for the similar-apps HTML page: the `similarItems` section is present. Then apply the endpoint's own checks: for lookups, non-zero `resultCount` and an identity and `kind` match; for search, zero results is a valid empty result; for the reviews feed, a missing `entry` key is the end of the data. Stop at the first failed check and report a distinct status per failure class. See [Retrieval Validation](endpoints/app-lookup.md#retrieval-validation)
2. **Encode free-text values** such as search terms and bundle IDs with `curl -G --data-urlencode`. Numeric IDs, page numbers, and country codes contain no reserved characters, so they are safe in the URL as literals or as shell variables
3. **Implement caching** to reduce API load
4. **Add rate limiting** (1-2s between requests)
5. **Batch requests** when possible using comma-separated IDs
6. **Handle errors gracefully** with retries and fallbacks

## API Limitations

- **Rate limiting**: No official limits, but be respectful (1-2s between requests)
- **Pagination**: Limited on some endpoints (max 200 results for search)
- **History**: Only current version data available via API
- **Similar apps**: Only IDs inside the page's "You Might Also Like" section qualify. Report unavailable when that section cannot be found; category and developer discovery are separate proxies.

## External Resources

- [iTunes Search API Documentation](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/)
- [RSS Feed Generator](https://rss.applemarketingtools.com/)
- [jq Documentation](https://jqlang.github.io/jq/)

---

**Start Here:** Use the decision trees above to find the right endpoint for your needs, then follow the links to detailed documentation.
