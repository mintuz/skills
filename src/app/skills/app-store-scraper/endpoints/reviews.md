# Reviews

Fetch user reviews for an app with pagination and sorting.

## Endpoint

```bash
https://itunes.apple.com/{country}/rss/customerreviews/page={page}/id={id}/sortby={sort}/json
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Numeric app ID |
| `country` | string | No | Market code (default: `us`) |
| `page` | number | No | Page number (1-10) |
| `sort` | string | No | Sort order: `mostrecent` or `mosthelpful` |

## Examples

### Recent Reviews

```bash
curl -s "https://itunes.apple.com/us/rss/customerreviews/page=1/id=553834731/sortby=mostrecent/json" | \
  jq '.feed.entry[1:] | .[] | {
    title: .title.label,
    author: .author.name.label,
    rating: .["im:rating"].label,
    content: .content.label,
    date: .updated.label
  }'
```

**Note:** Skip first entry (`[1:]`) as it contains app metadata, not a review.

### Most Helpful Reviews

```bash
curl -s "https://itunes.apple.com/us/rss/customerreviews/page=1/id=553834731/sortby=mosthelpful/json" | \
  jq '.feed.entry[1:] | .[] | {
    rating: .["im:rating"].label,
    title: .title.label,
    review: .content.label
  }'
```

### Fetch Multiple Pages

```bash
for page in {1..3}; do
  echo "=== Page $page ==="
  curl -s "https://itunes.apple.com/us/rss/customerreviews/page=${page}/id=553834731/sortby=mostrecent/json" | \
    jq -r '.feed.entry[1:] | .[] | "[\(.["im:rating"].label)★] \(.title.label) - \(.author.name.label)"'
  echo ""
done
```

### Filter by Rating

```bash
# Get only 5-star reviews
curl -s "https://itunes.apple.com/us/rss/customerreviews/page=1/id=553834731/sortby=mostrecent/json" | \
  jq '.feed.entry[1:] | .[] | select(.["im:rating"].label == "5") | {
    title: .title.label,
    author: .author.name.label,
    content: .content.label
  }'
```

### Reviews Summary

```bash
curl -s "https://itunes.apple.com/us/rss/customerreviews/page=1/id=553834731/sortby=mostrecent/json" | \
  jq '.feed.entry[1:] | group_by(.["im:rating"].label) | map({
    rating: .[0]["im:rating"].label,
    count: length
  })'
```

### Export to CSV

```bash
echo "Rating,Title,Author,Date" > reviews.csv

curl -s "https://itunes.apple.com/us/rss/customerreviews/page=1/id=553834731/sortby=mostrecent/json" | \
  jq -r '.feed.entry[1:] | .[] | [
    .["im:rating"].label,
    .title.label,
    .author.name.label,
    .updated.label
  ] | @csv' >> reviews.csv
```

### Get Review with Version Info

```bash
curl -s "https://itunes.apple.com/us/rss/customerreviews/page=1/id=553834731/sortby=mostrecent/json" | \
  jq '.feed.entry[1:] | .[] | {
    rating: .["im:rating"].label,
    title: .title.label,
    version: .["im:version"].label,
    date: .updated.label
  }'
```

## Response Structure

```json
{
  "feed": {
    "entry": [
      {
        "...": "app metadata (skip this - index 0)"
      },
      {
        "author": {
          "name": {"label": "Username"},
          "uri": {"label": "user-url"}
        },
        "updated": {"label": "2024-01-01T12:00:00-07:00"},
        "im:rating": {"label": "5"},
        "im:version": {"label": "1.0.0"},
        "id": {"label": "12345678"},
        "title": {"label": "Great app!"},
        "content": {
          "label": "This app is amazing. Highly recommend...",
          "attributes": {"type": "text"}
        },
        "link": {"attributes": {"href": "review-url"}},
        "im:voteSum": {"label": "10"},
        "im:voteCount": {"label": "12"}
      }
    ]
  }
}
```

## Pagination Limits

- Maximum 10 pages available
- Each page contains ~50 reviews
- First entry is always app metadata (not a review)
- Total accessible reviews: ~500 per app

## Collecting All Pages

Follow these rules when you combine pages into one data set:

1. Request pages in order from 1. Stop when the response `feed` has no `entry` key, or after page 10. A missing `entry` key is the end of the data, not an error.
2. Validate each page as exactly one JSON object with `jq -es 'length == 1 and (.[0] | type == "object")'` before you parse it. Wait 1-2 seconds between page requests.
3. Skip index 0 on every page. It is app metadata.
4. Deduplicate by the review `id.label` and keep the first occurrence, so that the most-recent order survives. Do not use `unique_by`: it sorts by the key. Adjacent pages can overlap when new reviews arrive between requests. Do not deduplicate by author or title.
5. Normalise each review to `{id, rating, title, content, version, date}`.
6. Set `complete: true` when an empty page ended the loop. Set `complete: false` when page 10 still had entries.
7. Write diagnostics to stderr. Write only the JSON result to stdout.

```bash
APP_ID=553834731
COUNTRY=us
COMPLETE=false
PAGES=()

for page in $(seq 1 10); do
  PAGE=$(curl -fsS "https://itunes.apple.com/${COUNTRY}/rss/customerreviews/page=${page}/id=${APP_ID}/sortby=mostrecent/json") || { echo "page ${page}: fetch failed" >&2; exit 1; }
  printf '%s' "$PAGE" | jq -es 'length == 1 and (.[0] | type == "object")' > /dev/null || { echo "page ${page}: invalid JSON" >&2; exit 1; }
  if ! printf '%s' "$PAGE" | jq -e '.feed.entry' > /dev/null; then COMPLETE=true; break; fi
  PAGES+=("$PAGE")
  sleep 2
done

printf '%s\n' "${PAGES[@]}" | jq -s --argjson complete "$COMPLETE" '{
  complete: $complete,
  reviews: ([ .[] | .feed.entry[1:][] | {
    id: .id.label,
    rating: .["im:rating"].label,
    title: .title.label,
    content: .content.label,
    version: .["im:version"].label,
    date: .updated.label
  } ] | reduce .[] as $r ({seen: {}, out: []}; if .seen[$r.id] then . else {seen: (.seen + {($r.id): true}), out: (.out + [$r])} end) | .out)
}'
```

## Sorting Options

### `mostrecent`
- Shows newest reviews first
- Best for monitoring recent feedback
- Useful for version-specific issues

### `mosthelpful`
- Shows most voted reviews first
- Better quality/detailed reviews
- Good for understanding common themes

## Use Cases

- Monitor user feedback over time
- Analyze sentiment by version
- Identify common issues or praise
- Generate review summaries
- Track rating trends
- Competitive analysis

## Tips

- Always skip first entry (`[1:]`) in results
- Add delay between page requests
- Reviews are region-specific
- Not all apps have reviews in all regions
- Review availability depends on app's release date
