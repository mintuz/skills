---
name: principle-migrate-callers-then-delete-legacy-apis
description: "WHEN replacing an API with supported callers; NOT routine API usage; migrate consumers and retire the old contract."
---

# Migrate Callers Then Delete Legacy Apis

Inventory supported consumers before deletion: direct calls, generated clients, other repositories, persisted formats and release compatibility. Record unknown coverage as a gap.

For a coordinated internal change, migrate callers and remove the old API in one verifiable unit. Temporary adapters need a named consumer, removal condition and bounded lifetime. Preserve externally supported contracts until consumers migrate or the owner explicitly authorizes the compatibility break.

Exercise the replacement through its consumers. Retain tests of supported behavior, including failures; retire assertions that protect only removed implementation details. Check generated artifacts, consumer builds and remaining references. Delete the legacy path when its supported consumers and guarantees are accounted for; a repository text search alone is insufficient proof.
