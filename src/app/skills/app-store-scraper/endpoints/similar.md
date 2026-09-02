# Similar Apps

Find apps that Apple presents as similar to a given app. The App Store page shows these in the shelf headed **"You Might Also Like"** (older documentation calls this shelf "Customers Also Bought").

## Endpoint

```bash
https://apps.apple.com/{country}/app/id{id}
```

**Note:** This requires web scraping, not a structured API.

## Retrieval Contract

1. Fetch the page and parse it as HTML, or parse the JSON page-state that the page embeds in a `<script type="application/json">` element.
2. Locate the "You Might Also Like" section and extract app links only within it.
3. If the section cannot be identified, report recommendations as unavailable. A page-wide app-ID scan mixes navigation, developer, source-app, and unrelated links.
4. Exclude the source ID, validate numeric IDs, deduplicate in page order, and apply the requested limit.
5. Batch the selected IDs through App Lookup with `entity=software` and the same country. Return metadata only for requested IDs that the lookup actually resolves.

## Examples

### Extract Similar Apps from the Recommendation Section

```bash
APP_ID=553834731
COUNTRY=us
LIMIT=10

# -L is required: the id-only URL redirects to the app's slug URL and the redirect body is empty.
PAGE=$(curl -fsSL "https://apps.apple.com/${COUNTRY}/app/id${APP_ID}") || { echo '{"source":"apple-recommendation","status":"fetch-failed"}'; exit 1; }

# Keep only the recommendation section: from its <section id="similarItems"> open tag to the end of that <section>.
# Anchor on the id, not on the heading text: the heading text also appears in embedded JSON.
SHELF=$(printf '%s' "$PAGE" | perl -0777 -ne 'print $1 if /(<section id="similarItems".*?<\/section>)/s')

if [ -z "$SHELF" ]; then
  echo '{"source":"apple-recommendation","status":"unavailable"}'
  exit 0
fi

# Section-scoped IDs: numeric, not the source app, first occurrence only, page order.
SIMILAR_IDS=$(printf '%s' "$SHELF" | \
  grep -oE '/app/[^"'"'"' ]*id[0-9]+' | \
  grep -oE '[0-9]+$' | \
  grep -vx "$APP_ID" | \
  awk '!seen[$0]++' | \
  head -n "$LIMIT" | \
  paste -sd, -)

[ -n "$SIMILAR_IDS" ] || { echo '{"source":"apple-recommendation","status":"unavailable"}'; exit 0; }

# Validate the lookup body before extraction. Keep only iOS results whose trackId is one of the requested IDs.
LOOKUP=$(curl -fsS -G "https://itunes.apple.com/lookup" \
  --data-urlencode "id=${SIMILAR_IDS}" \
  --data-urlencode "country=${COUNTRY}" \
  --data-urlencode "entity=software") || { echo '{"source":"apple-recommendation","status":"fetch-failed"}'; exit 1; }
printf '%s' "$LOOKUP" | jq -es 'length == 1 and (.[0] | type == "object")' > /dev/null || { echo '{"source":"apple-recommendation","status":"parse-failed"}'; exit 1; }
printf '%s' "$LOOKUP" | jq --arg ids "$SIMILAR_IDS" '
  ($ids | split(",") | map(tonumber)) as $want
  | {source: "apple-recommendation", status: "ok",
     apps: [.results[] | select(.kind == "software" and (.trackId as $t | $want | index($t) != null))
            | {name: .trackName, id: .trackId, developer: .artistName, rating: .averageUserRating}]}'
```

On the live page the shelf is `<section id="similarItems" aria-label="You Might Also Like">`; the example above anchors on that id. If you have `pup` or `htmlq` installed, select links inside that section only, for example `pup 'section#similarItems a[href*="/app/"] attr{href}'`.

Verify the heading text and the markup against the live page before you depend on this example. Apple changes the page without notice.

## Limitations

- Requires HTML parsing (not a structured API)
- Page structure may change without notice
- "You Might Also Like" section may not always be present
- Results depend on Apple's recommendation algorithm
- Rate limiting may apply for frequent requests

## Separate Discovery Signals

The following can supply comparison candidates, but they do not prove Apple presented those apps as similar. Label the source as `category` or `same-developer`, not `apple-recommendation`.

### By Category

Find comparison candidates by browsing the same category:

```bash
# Get app's category
CATEGORY=$(curl -s "https://itunes.apple.com/lookup?id=553834731&entity=software" | \
  jq -r '.results[0].primaryGenreName')

# Search for apps in same category
curl -s -G "https://itunes.apple.com/search" \
  --data-urlencode "term=${CATEGORY}" \
  --data-urlencode "media=software" \
  --data-urlencode "entity=software" \
  --data-urlencode "limit=20" | \
  jq '.results[] | {name: .trackName, category: .primaryGenreName}'
```

### By Developer

Find other apps from the same developer:

```bash
DEV_ID=$(curl -s "https://itunes.apple.com/lookup?id=553834731" | \
  jq -r '.results[0].artistId')

curl -s "https://itunes.apple.com/lookup?id=${DEV_ID}&entity=software" | \
  jq '.results[] | select(.wrapperType == "software") | .trackName'
```

## Use Cases

- App recommendation systems
- Competitive analysis
- Market research
- Related app discovery
- Cross-promotion opportunities

## Best Practices

1. Cache results to minimize requests
2. Add delays between scraping requests
3. Handle a missing "You Might Also Like" section gracefully
4. Validate extracted IDs before lookup
5. Consider using official API endpoints when possible
