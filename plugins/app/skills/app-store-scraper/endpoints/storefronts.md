# Storefront Headers

Ratings and suggestions use an undocumented `X-Apple-Store-Front` header. The storefront ID must match the query contract's country.

| Country | Code | Storefront ID | Country | Code | Storefront ID |
| --- | --- | --- | --- | --- | --- |
| United States | `us` | `143441` | United Kingdom | `gb` | `143444` |
| Germany | `de` | `143443` | France | `fr` | `143442` |
| Japan | `jp` | `143462` | Australia | `au` | `143460` |
| Canada | `ca` | `143455` | Spain | `es` | `143454` |
| Italy | `it` | `143450` | Brazil | `br` | `143503` |
| India | `in` | `143467` | Mexico | `mx` | `143468` |
| South Korea | `kr` | `143466` | China | `cn` | `143465` |

Format the header as:

```bash
-H "X-Apple-Store-Front: ${STOREFRONT_ID}-1,29 l=${LANGUAGE}"
```

Use a short language code such as `en` for this private endpoint. For an unlisted storefront, resolve and verify its ID before issuing the request; a guessed ID can silently return another market or HTML.

**Complete when:** the country in the request URL matches the country mapped to the storefront ID in the header.
