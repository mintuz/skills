---
name: principle-migrate-callers-then-delete-legacy-apis
description: "WHEN replacing an API with supported callers; NOT routine API usage; migrate consumers and retire the old contract."
---

# Migrate Callers Then Delete Legacy Apis

Migrate every supported consumer, then delete the old contract.

Inventory supported consumers before deletion: direct calls, generated clients, other repositories, persisted formats and release compatibility. Record unknown coverage as a gap.

For a coordinated internal change, migrate callers and remove the old API in one verifiable unit. Temporary adapters need a named consumer, removal condition and bounded lifetime. Preserve externally supported contracts until consumers migrate or the owner explicitly authorises the compatibility break.

A request to rename, retype or remove a name in a contract with consumers outside the change asks for the new shape; it does not approve the break. Add any new name beside the old one. Keep the old name working. Mark it superseded where its consumers see it. Give it a removal condition. When the owner explicitly approves the break, remove the old name. When the removal fixes a security or privacy exposure, such as an exposed sensitive field, remove the name now and keep no alias for it.

Exercise the replacement through its consumers. Retain tests of supported behaviour, including failures; retire assertions that protect only removed implementation details.

Delete the legacy path when its supported consumers and guarantees are accounted for. Remove transitional and obsolete paths, such as adapters, fallbacks and dual writes, once their consumers and guarantees are covered; keep only the path an uncovered consumer still needs. Before each deletion, check generated artifacts, consumer builds and remaining references; a repository text search alone is insufficient proof.

Distinct from: `principle-outcome-oriented-execution` (an approved multi-phase change converging on an end state), `principle-subtract-before-you-add` (about to add a mechanism, owner or layer).

Done: no supported consumer uses the old path; transitional paths whose consumers and guarantees are covered are gone; any remaining temporary adapter has an owner and end date.
