# Search Suggestions

Use this undocumented endpoint for storefront-specific App Store query completions:

```text
https://search.itunes.apple.com/WebObjects/MZSearchHints.woa/wa/hints
```

The response is an XML property list, and the endpoint needs a storefront header to return regional suggestions. Read [Storefront headers](storefronts.md) first.

## Request

On macOS, use native `plutil` to convert the plist to JSON:

```bash
curl --fail-with-body --silent --show-error --get \
  'https://search.itunes.apple.com/WebObjects/MZSearchHints.woa/wa/hints' \
  --data-urlencode 'clientApplication=Software' \
  --data-urlencode "term=${TERM}" \
  -H "X-Apple-Store-Front: ${STOREFRONT_ID}-1,29 l=${LANGUAGE}" |
  plutil -convert json -o - -- - |
  jq '{suggestions: [.hints[]? | {term, url}]}'
```

## Validate

Require a plist dictionary that converts to a JSON object with `hints` as an array. Each hint is an object containing a nonempty `term`; `url` is optional output metadata. Preserve provider order.

An empty array is a valid response after schema validation. Suggestions are volatile and reflect Apple's current storefront behavior; label the retrieval time.

**Complete when:** the plist parses, storefront and term are explicit, every returned hint has a term, and provider order is preserved.
