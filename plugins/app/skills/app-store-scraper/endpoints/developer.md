# Developer Portfolio

Use Lookup with a developer `artistId` to retrieve the software records Apple returns for that developer in one storefront.

If only an app ID or bundle ID is known, use [App lookup](app-lookup.md) first and take its `artistId`.

## Request

Choose `software` for iOS/iPadOS or `macSoftware` for macOS:

```bash
curl --fail-with-body --silent --show-error --get \
  'https://itunes.apple.com/lookup' \
  --data-urlencode "id=${DEVELOPER_ID}" \
  --data-urlencode "country=${COUNTRY}" \
  --data-urlencode "entity=${ENTITY}"
```

## Validate and select

The response can contain an artist record followed by software records. Select by schema:

```jq
[
  .results[]
  | select(.wrapperType == "software")
  | select((.artistId | tostring) == $developerId)
  | {
      appId: .trackId,
      name: .trackName,
      bundleId,
      category: .primaryGenreName,
      rating: .averageUserRating,
      ratingCount: .userRatingCount,
      price,
      currency
    }
]
```

Pass `--arg developerId "$DEVELOPER_ID"` to `jq`. Require an object with numeric `resultCount` and array `results`; then verify any artist record and every selected software record use the requested `artistId`.

Lookup publishes no developer-portfolio pagination contract. Describe the output as the records returned for this storefront rather than proof of a developer's globally exhaustive portfolio.

**Complete when:** the developer ID is resolved, all selected software records match it and the storefront, and provider coverage is stated without an unsupported completeness claim.
