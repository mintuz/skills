# Reviews

Use the public RSS endpoint for written reviews of a numeric app ID. This endpoint is undocumented and can return no entries for apps that have visible reviews elsewhere.

## Request

```text
https://itunes.apple.com/{country}/rss/customerreviews/page={page}/id={app_id}/sortby={sort}/json
```

Use `mostrecent` or `mosthelpful` for `sort`. Fetch only the pages in the query contract, in ascending page order, and stop after an empty page.

## Validate and select

Require `.feed` to be an object. Normalize `feed.entry`, then select review records by the presence of `im:rating`; position is not a record type:

```jq
(.feed.entry // [])
| if type == "array" then . else [.] end
| map(
    select(has("im:rating"))
    | {
        reviewId: .id.label,
        title: .title.label,
        author: .author.name.label,
        rating: (.["im:rating"].label | tonumber),
        version: .["im:version"].label,
        body: .content.label,
        updated: .updated.label,
        voteCount: (.["im:voteCount"].label | tonumber),
        voteSum: (.["im:voteSum"].label | tonumber)
      }
  )
```

An absent `entry` after a valid feed is an empty page, not a parser error. Deduplicate multi-page results by `reviewId`. Reviews are storefront-specific and the public feed is not proof of all reviews.

For authenticated access to reviews of an owned app, Apple's App Store Connect API is the supported alternative and is outside this skill's public-data scope.

**Complete when:** every requested page is valid or has an explicit endpoint failure, all selected records carry `im:rating`, review IDs are unique, and public-feed coverage is labeled.
