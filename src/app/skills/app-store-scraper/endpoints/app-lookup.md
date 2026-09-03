# App Lookup

Retrieve detailed information for a specific app using its numeric ID or bundle identifier.

## Endpoint

```bash
https://itunes.apple.com/lookup
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes* | Numeric app ID (trackId) |
| `bundleId` | string | Yes* | Bundle identifier (e.g., com.example.app) |
| `country` | string | No | Market code (default: `us`) |
| `entity` | string | No | `software` for iOS apps, `macSoftware` for macOS apps; the result's `kind` is `software` or `mac-software` |
| `lang` | string | No | Language preference |

*Use either `id` OR `bundleId`, not both

## Retrieval Validation

Check the response in this order before you extract fields. Stop at the first failed check; do not run the extraction step after a failed check.

1. Require a successful transport and HTTP response. Use `curl -fsS` so that an HTTP error exits non-zero.
2. Require exactly one JSON object. Use `jq -es 'length == 1 and (.[0] | type == "object")'`. Do not use `jq empty`: it exits 0 on an empty body. Do not use `jq -e empty`: `empty` produces no output, so `-e` exits 4 on valid JSON.
3. Require a non-zero `resultCount`. Treat zero results as unavailable.
4. Select the result whose `trackId` or `bundleId` equals the requested identity and whose `kind` matches the platform (`software` for iOS, `mac-software` for macOS). Do not read `.results[0]` blindly. When no result matches, treat the response as a retrieval-integrity error.

Report one outcome per storefront with a distinct `status` for each failure class: `ok`, `unavailable` (zero results), `integrity-error` (identity or platform mismatch), `fetch-failed` (transport or HTTP), `parse-failed` (invalid JSON). Do not report an integrity error as `unavailable`. Never build an app record from null fields. Never reuse another storefront's result as evidence for this storefront.

```bash
BODY=$(curl -fsS -G "https://itunes.apple.com/lookup" \
  --data-urlencode "bundleId=$BUNDLE_ID" \
  --data-urlencode "country=$COUNTRY" \
  --data-urlencode "entity=software") || { echo '{"status":"fetch-failed"}'; exit 1; }
printf '%s' "$BODY" | jq -es 'length == 1 and (.[0] | type == "object")' > /dev/null || { echo '{"status":"parse-failed"}'; exit 1; }
printf '%s' "$BODY" | jq --arg b "$BUNDLE_ID" '
    ([.results[] | select(.bundleId == $b and .kind == "software")]) as $m
    | if .resultCount == 0 then {status: "unavailable"}
      elif ($m | length) == 0 then {status: "integrity-error"}
      else {status: "ok", app: ($m[0] | {name: .trackName, id: .trackId, bundleId})} end'
```

Numeric IDs, page numbers, and country codes contain no reserved characters, so they are safe in the URL as literals or as shell variables, as in the examples below. Pass free-text values, such as search terms and bundle IDs, with `curl -G --data-urlencode`, as above, so that curl encodes spaces and reserved characters such as `&`.

## Examples

The examples below show field selection only. In a script, run the Retrieval Validation gates first and select the matching result instead of `.results[0]`.

### Lookup by App ID

```bash
curl -s "https://itunes.apple.com/lookup?id=553834731&country=us&entity=software" | \
  jq '.results[0] | {
    name: .trackName,
    developer: .artistName,
    bundleId: .bundleId,
    version: .version,
    price: .price,
    rating: .averageUserRating,
    ratingCount: .userRatingCount,
    description: .description,
    releaseDate: .releaseDate,
    size: .fileSizeBytes,
    languages: .languageCodesISO2A
  }'
```

### Lookup by Bundle ID

```bash
curl -s "https://itunes.apple.com/lookup?bundleId=com.apple.Numbers&country=us&entity=software" | \
  jq '.results[0] | {
    name: .trackName,
    appId: .trackId,
    developer: .artistName,
    category: .primaryGenreName
  }'
```

### Lookup Multiple Apps

```bash
curl -s "https://itunes.apple.com/lookup?id=553834731,361309726&country=us&entity=software" | \
  jq '.results[] | {name: .trackName, id: .trackId}'
```

## Key Response Fields

```json
{
  "trackId": 553834731,
  "trackName": "App Name",
  "bundleId": "com.example.app",
  "artistName": "Developer Name",
  "artistId": 12345,
  "price": 0.0,
  "currency": "USD",
  "version": "1.0.0",
  "averageUserRating": 4.5,
  "userRatingCount": 1234,
  "description": "Full app description...",
  "releaseDate": "2024-01-01T00:00:00Z",
  "fileSizeBytes": "52428800",
  "contentAdvisoryRating": "4+",
  "languageCodesISO2A": ["EN", "ES", "FR"],
  "genres": ["Productivity", "Business"],
  "primaryGenreName": "Productivity"
}
```

## Use Cases

- Get comprehensive app metadata
- Lookup apps by bundle identifier
- Fetch multiple apps in a single request
- Retrieve developer ID for further queries
- Check app availability in different countries
