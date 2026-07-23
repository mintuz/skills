# App Lookup

Use Lookup for metadata by numeric app ID or bundle ID, and for bulk enrichment after another branch returns app IDs. Use `software` for iOS/iPadOS and `macSoftware` for macOS.

Apple documents Lookup in the [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/LookupExamples.html).

## Request

By app ID:

```bash
curl --fail-with-body --silent --show-error --get \
  'https://itunes.apple.com/lookup' \
  --data-urlencode "id=${APP_ID}" \
  --data-urlencode "country=${COUNTRY}" \
  --data-urlencode "entity=${ENTITY}"
```

By bundle ID:

```bash
curl --fail-with-body --silent --show-error --get \
  'https://itunes.apple.com/lookup' \
  --data-urlencode "bundleId=${BUNDLE_ID}" \
  --data-urlencode "country=${COUNTRY}" \
  --data-urlencode "entity=${ENTITY}"
```

For bulk lookup, pass comma-separated numeric IDs in `id`. Match the response back to the request by `trackId`; response position is not the join key.

## Validate and select

Require an object with numeric `resultCount` and array `results`. A valid zero count means the app is unavailable for that identifier and storefront.

For an ID lookup, require one result whose stringified `trackId` equals the requested ID. For a bundle lookup, compare `bundleId` exactly. Useful fields include:

```jq
.results[] | {
  appId: .trackId,
  name: .trackName,
  bundleId,
  developerId: .artistId,
  developer: .artistName,
  version,
  price,
  currency,
  rating: .averageUserRating,
  ratingCount: .userRatingCount,
  category: .primaryGenreName,
  releaseDate: .currentVersionReleaseDate,
  description
}
```

For a bulk request, report every missing requested ID separately.

**Complete when:** each requested identifier has one matching storefront record or an explicit unavailable result, and every selected field exists or is reported missing.
