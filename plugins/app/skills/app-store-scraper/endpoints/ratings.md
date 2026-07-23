# Ratings Histogram

Use this undocumented endpoint for a storefront's one-to-five-star distribution:

```text
https://itunes.apple.com/{country}/customer-reviews/id{app_id}?displayable-kind=11
```

Read [Storefront headers](storefronts.md) and send the matching header. Without it, the endpoint can return HTML instead of JSON.

## Request

```bash
curl --fail-with-body --silent --show-error \
  "https://itunes.apple.com/${COUNTRY}/customer-reviews/id${APP_ID}?displayable-kind=11" \
  -H "X-Apple-Store-Front: ${STOREFRONT_ID}-1,29 l=${LANGUAGE}"
```

## Validate and select

The current response exposes rating fields at the top level:

```jq
{
  appId: .adamId,
  average: .ratingAverage,
  totalRatings: .ratingCount,
  totalWrittenReviews: .totalNumberOfReviews,
  distribution: (
    .ratingCountList
    | to_entries
    | map({stars: (.key + 1), count: .value})
  )
}
```

Require:

- `adamId` equals the requested numeric app ID;
- `ratingAverage` is numeric;
- `ratingCount` is a nonnegative integer;
- `ratingCountList` is an array of five nonnegative integers;
- the five counts sum to `ratingCount`.

Treat schema drift as an endpoint failure and report the observed top-level keys. Ratings are storefront-specific; compare regions only after each response independently passes validation.

**Complete when:** app ID and storefront match, all five buckets reconcile to the total, and every requested region has a valid histogram or explicit failure.
