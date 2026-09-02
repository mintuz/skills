# Ratings Histogram

Get the rating distribution (1-5 star breakdown) for an app in one storefront.

## Endpoint

```bash
https://itunes.apple.com/{country}/customer-reviews/id{id}?displayable-kind=11
```

## Required Headers

```bash
X-Apple-Store-Front: {storefront_id}-1,29 l=en
```

Without the header the endpoint returns an HTML "Connecting to the iTunes Store" page, not JSON.

## Common Storefront IDs

| Country | Code | Storefront ID | Country | Code | Storefront ID |
|---------|------|---------------|---------|------|---------------|
| United States | `us` | `143441` | United Kingdom | `gb` | `143444` |
| Germany | `de` | `143443` | France | `fr` | `143442` |
| Japan | `jp` | `143462` | Australia | `au` | `143460` |
| Canada | `ca` | `143455` | Spain | `es` | `143454` |
| Italy | `it` | `143450` | Brazil | `br` | `143503` |
| India | `in` | `143467` | Mexico | `mx` | `143468` |
| South Korea | `kr` | `143466` | China | `cn` | `143465` |

## Response Structure

The response is one JSON object. `ratingCountList` is an array of five integers in star order: index 0 is the 1-star count and index 4 is the 5-star count.

```json
{
  "adamId": 553834731,
  "kindExtId": "iosSoftware",
  "ratingAverage": 4.5,
  "ratingCount": 3994414,
  "ratingCountList": [80491, 45615, 138729, 442636, 3286943],
  "totalNumberOfReviews": 484403,
  "ariaLabelForRatings": "4 and a half stars"
}
```

The response does not separate current-version ratings from all-time ratings. For `averageUserRatingForCurrentVersion` and `userRatingCountForCurrentVersion`, use [App Lookup](app-lookup.md).

## Examples

### Basic Rating Histogram

```bash
curl -s "https://itunes.apple.com/us/customer-reviews/id553834731?displayable-kind=11" \
  -H "X-Apple-Store-Front: 143441-1,29 l=en" | \
  jq '{
    avgRating: .ratingAverage,
    totalRatings: .ratingCount,
    totalReviews: .totalNumberOfReviews,
    ratingCountList
  }'
```

### Extract Star Breakdown

```bash
curl -s "https://itunes.apple.com/us/customer-reviews/id553834731?displayable-kind=11" \
  -H "X-Apple-Store-Front: 143441-1,29 l=en" | \
  jq '[.ratingCountList | to_entries[] | {stars: (.key + 1), count: .value}]'
```

### Calculate Percentages

```bash
curl -s "https://itunes.apple.com/us/customer-reviews/id553834731?displayable-kind=11" \
  -H "X-Apple-Store-Front: 143441-1,29 l=en" | \
  jq '.ratingCount as $total
    | [.ratingCountList | to_entries[] | {
        stars: (.key + 1),
        count: .value,
        percentage: (if $total == 0 then 0 else (.value / $total * 100 | round) end)
      }]'
```

### Format as Chart

```bash
curl -s "https://itunes.apple.com/us/customer-reviews/id553834731?displayable-kind=11" \
  -H "X-Apple-Store-Front: 143441-1,29 l=en" | \
  jq -r '.ratingCount as $total
    | .ratingCountList | to_entries | reverse[]
    | "[\(.key + 1)★] \("█" * (if $total == 0 then 0 else (.value / $total * 40) | floor end)) \(.value)"'
```

### Multiple Countries

```bash
for country in us gb de jp; do
  case $country in
    us) storefront=143441 ;;
    gb) storefront=143444 ;;
    de) storefront=143443 ;;
    jp) storefront=143462 ;;
  esac

  echo "=== $country ==="
  curl -s "https://itunes.apple.com/$country/customer-reviews/id553834731?displayable-kind=11" \
    -H "X-Apple-Store-Front: $storefront-1,29 l=en" | \
    jq '{avgRating: .ratingAverage, totalRatings: .ratingCount, ratingCountList}'
  echo ""
  sleep 1
done
```

## Important Notes

- **Requires X-Apple-Store-Front header** - the request returns HTML without it
- Storefront ID must match the country in the URL
- An unknown app ID returns HTTP 404 with an empty body
- Some apps may not have rating histogram data
- Verify the response keys against the live response before you depend on them; Apple changes this undocumented endpoint without notice

## Finding Storefront IDs

If you need a storefront ID not listed:

```bash
# Visit an App Store page and inspect headers
curl -I "https://apps.apple.com/us/app/id553834731" | grep -i "x-apple"
```

Or use these common patterns:
- US: 143441
- UK: 143444
- Most EU countries: 1434XX range
- Asia-Pacific: 1434XX-1434XX range

## Use Cases

- Detailed rating analysis
- Compare ratings across regions
- Calculate rating distribution
- Monitor rating trends over time
- Generate rating visualizations
- Quality metrics reporting

## Combining with Other Data

```bash
APP_ID=553834731

# Get basic info
APP_NAME=$(curl -s "https://itunes.apple.com/lookup?id=$APP_ID" | jq -r '.results[0].trackName')

# Get rating histogram
echo "Rating breakdown for: $APP_NAME"
curl -s "https://itunes.apple.com/us/customer-reviews/id$APP_ID?displayable-kind=11" \
  -H "X-Apple-Store-Front: 143441-1,29 l=en" | \
  jq -r '.ratingCountList | to_entries[] | "\(.key + 1) stars: \(.value) ratings"'
```

## Error Handling

```bash
APP_ID=999999999

# -fsS exits non-zero on HTTP 404 (unknown app) and on transport errors.
RESPONSE=$(curl -fsS "https://itunes.apple.com/us/customer-reviews/id${APP_ID}?displayable-kind=11" \
  -H "X-Apple-Store-Front: 143441-1,29 l=en") || { echo '{"status":"fetch-failed"}'; exit 1; }
printf '%s' "$RESPONSE" | jq -es 'length == 1 and (.[0] | type == "object")' > /dev/null || { echo '{"status":"parse-failed"}'; exit 1; }
# Require the requested adamId and a five-number histogram before you accept the data.
printf '%s' "$RESPONSE" | jq --argjson id "$APP_ID" '
  if .adamId != $id then {status: "integrity-error"}
  elif (.ratingCountList | type) == "array" and (.ratingCountList | length) == 5 then {status: "ok", ratingAverage, ratingCount, ratingCountList}
  else {status: "unavailable"} end'
```
