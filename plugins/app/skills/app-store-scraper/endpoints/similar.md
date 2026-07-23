# Similar Apps

Apple exposes no documented public similar-app API. Choose the closest source the query contract can support and label it:

1. **Same developer:** resolve `artistId`, then use [Developer portfolio](developer.md).
2. **Same category or phrase:** use [Search](search.md) and filter to the source app's category.
3. **Apple “You Might Also Like”:** use the App Store HTML only when the user supplies an authorized basis for page retrieval.

API proxies are related candidates, not Apple's recommendation set.

## Authorized HTML heuristic

Apple's [Website Terms of Use](https://www.apple.com/legal/internet-services/terms/site.html) prohibit page scraping. When separate authorization applies, fetch the product page and scope extraction to the `similarItems` section:

```bash
curl --fail-with-body --silent --show-error --location \
  "https://apps.apple.com/${COUNTRY}/app/id${APP_ID}" |
  xmllint --html --xpath \
    '//section[@id="similarItems"]//a[contains(@href,"/app/")]/@href' - 2>/dev/null |
  rg -o 'id[0-9]+' |
  rg -o '[0-9]+' |
  sort -u
```

Remove the source app ID, validate every candidate as numeric, and use [App lookup](app-lookup.md) for metadata. The page structure and recommendations can change without notice; an absent `similarItems` section is an unavailable result.

**Complete when:** the method is named, every candidate traces to that method, the source app is excluded, API proxies are labeled as proxies, and HTML results include authorization and schema limitations.
