# Entities and Queries

## `AppEntity` Identity and `@Property` Visibility

- `AppEntity` refines `Identifiable` where `ID: EntityIdentifierConvertible & Sendable`.
- `String`, `UUID`, and `Int` conform automatically. Custom `ID` types must implement `entityIdentifierString` and `entityIdentifier(for:)`.
- **Length limit:** `entityIdentifierString` must be `<= 4096` characters; the framework silently truncates longer strings.
- **Cross-device stability:** Avoid array indices, local DB row IDs, display names, or device-local IDs (such as Photos `localIdentifier`). Saved shortcuts and donations store `AppEntity.id` across launches, devices, and re-imports.
- **`@Property` visibility:** Only `@Property`-wrapped members on `AppEntity` are visible to Shortcuts Find actions, `EntityPropertyQuery`, and system parameter inspection. Plain `let`/`var` properties compile silently but are invisible to the system (valid only for internal data used by `displayRepresentation`).

## `EntityQuery`, `EntityStringQuery`, and `EnumerableEntityQuery`

- **`entities(for identifiers:)`:** Required. Perform one batched lookup (avoid per-ID N+1 loops). Return only records that still exist; omit missing IDs without throwing or substituting another record. The framework reorders results to match the requested order.
- **`suggestedEntities()`:** Has a default implementation returning `[]`. Always override it with a fast, bounded (`limit:`) context-scoped query, or the Shortcuts parameter picker appears empty.
- **`EntityStringQuery` (`entities(matching string:)`):** No framework-side filtering over `suggestedEntities()`; your implementation owns matching and ranking.
- **`EnumerableEntityQuery` (iOS 17+):** Implements `allEntities()` so Shortcuts auto-generates Find and filters in memory. Use only for small, bounded catalogues; for large or unbounded stores, use `EntityPropertyQuery`.

## `EntityPropertyQuery`

Use `EntityPropertyQuery` to power Shortcuts "Find X where…" over large stores without loading every record into memory.

1. Declare `typealias ComparatorMappingType` for your store's predicate type.
2. Declare `static var properties: QueryProperties` and `static var sortingOptions: SortingOptions` using `$`-projected `@Property` key paths (`\.$title`, never `\.title`).
3. Match comparators strictly to property types (mismatches produce opaque generic errors):
   - `EqualToComparator`, `NotEqualToComparator` → `Equatable`
   - `GreaterThanComparator`, `GreaterThanOrEqualToComparator`, `LessThanComparator`, `LessThanOrEqualToComparator` → `Comparable`
   - `ContainsComparator` → `String`/`AttributedString` (substring) or collection (membership)
   - `HasPrefixComparator`, `HasSuffixComparator` → `String` only
   - `IsBetweenComparator` → two inputs; surfaced only for `Date` in Shortcuts
4. Implement `func entities(matching comparators: [ComparatorMappingType], mode: ComparatorMode, sortedBy: [Sort<Entity>], limit: Int?) async throws -> [Entity]`.

**Execution trap:** The framework only parses the user's filter into `comparators`, `mode` (`.and`/`.or`), `sortedBy` (`Sort<Entity>.by` and `.order`), and `limit`. It does **not** filter, sort, or limit results after your query returns — your implementation must apply all four against the data layer.
