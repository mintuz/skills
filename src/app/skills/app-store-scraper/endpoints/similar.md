# Similar Apps

Find apps similar to a given app (based on "Customers Also Bought").

## Endpoint

```bash
https://apps.apple.com/{country}/app/id{id}
```

**Note:** This requires web scraping, not a structured API.

## Retrieval Contract

1. Parse the page as HTML or its embedded page-state data.
2. Locate the named recommendation section and extract app links only within it.
3. If the section cannot be identified, report recommendations as unavailable. A page-wide app-ID scan mixes navigation, developer, source-app, and unrelated links.
4. Exclude the source ID, validate numeric IDs, deduplicate in page order, and apply the requested limit.
5. Batch the selected IDs through App Lookup with `entity=software` and the same country. Return metadata only for requested IDs that the lookup actually resolves.

## Limitations

- Requires HTML parsing (not a structured API)
- Page structure may change without notice
- "Customers Also Bought" section may not always be present
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
curl -s "https://itunes.apple.com/search?term=${CATEGORY}&media=software&entity=software&limit=20" | \
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
3. Handle missing "Similar Apps" section gracefully
4. Validate extracted IDs before lookup
5. Consider using official API endpoints when possible
