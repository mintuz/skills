# App Charts

Use Apple's current RSS Builder for top-free and top-paid charts. Use the legacy feed only for a requested chart or category the current builder does not expose.

## Current RSS Builder

The [Apple RSS Builder](https://rss.marketingtools.apple.com/) generates App Store chart feeds.

```bash
curl --fail-with-body --silent --show-error --location \
  "https://rss.marketingtools.apple.com/api/v2/${COUNTRY}/apps/${CHART}/${LIMIT}/apps.json"
```

Use `top-free` or `top-paid` for `CHART`, and a builder-supported limit such as 10, 25, or 50. Require `.feed.results` to be an array:

```jq
.feed.results
| to_entries
| map({
    rank: (.key + 1),
    appId: .value.id,
    name: .value.name,
    developer: .value.artistName,
    releaseDate: .value.releaseDate,
    genres: .value.genres,
    url: .value.url
  })
```

Preserve array order as chart rank.

## Legacy chart fallback

The legacy endpoint remains useful for top grossing, new-app, and genre-specific requests, but its contract is undocumented and volatile:

```text
https://itunes.apple.com/{country}/rss/{collection}/[genre={genre_id}/]limit={limit}/json
```

Known collections include `topfreeapplications`, `toppaidapplications`, `topgrossingapplications`, `newapplications`, and `newfreeapplications`. Common genres include Games `6014`, Business `6000`, Finance `6015`, Health & Fitness `6016`, Productivity `6024`, Social Networking `6026`, Travel `6012`, and Utilities `6002`.

Normalize a singleton or array before assigning ranks:

```jq
(.feed.entry // [])
| if type == "array" then . else [.] end
| to_entries
| map({
    rank: (.key + 1),
    appId: .value.id.attributes["im:id"],
    name: .value["im:name"].label,
    developer: .value["im:artist"].label,
    category: .value.category.attributes.label,
    price: .value["im:price"].attributes.amount,
    currency: .value["im:price"].attributes.currency
  })
```

Use [App lookup](app-lookup.md) to enrich chart IDs. Join by app ID while retaining the feed's rank.

**Complete when:** the chart, storefront, feed version, limit, and optional genre are explicit; every entry has a stable rank and app ID; and legacy-feed use is labeled.
