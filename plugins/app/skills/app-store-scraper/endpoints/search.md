# App Search

Use Search for keyword discovery. Search results are provider-ranked candidates, not an exhaustive catalog.

Apple documents the parameters and limits in [Constructing Searches](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/Searching.html).

## Request

Choose `software` for iOS/iPadOS or `macSoftware` for macOS:

```bash
curl --fail-with-body --silent --show-error --get \
  'https://itunes.apple.com/search' \
  --data-urlencode "term=${TERM}" \
  --data-urlencode "country=${COUNTRY}" \
  --data-urlencode 'media=software' \
  --data-urlencode "entity=${ENTITY}" \
  --data-urlencode "limit=${LIMIT}"
```

`limit` accepts 1 through 200 and defaults to 50. The API exposes no offset, so client-side slicing only narrows the returned window; it does not fetch later catalog results. The documented `lang` values are `en_us` and `ja_jp`.

## Validate and select

Require an object with numeric `resultCount` and array `results`. Preserve response order unless the user requests another sort.

```jq
.results
| to_entries
| map({
    rank: (.key + 1),
    appId: .value.trackId,
    name: .value.trackName,
    bundleId: .value.bundleId,
    developerId: .value.artistId,
    developer: .value.artistName,
    category: .value.primaryGenreName,
    rating: .value.averageUserRating,
    ratingCount: .value.userRatingCount,
    price: .value.price,
    currency: .value.currency
  })
```

Apply requested category, price, rating, or developer filters after validating the response. Report the original limit and the number remaining after filters.

**Complete when:** the search term, entity, storefront, and returned window are explicit; provider rank is preserved or the replacement sort is named; and truncation at 200 is reported.
