---
name: principle-outcome-oriented-execution
description: "WHEN an approved migration has explicit phase boundaries; NOT unmanaged breakage; converge on the verified end-state contract."
---

# Outcome Oriented Execution

State the accepted end-state behavior and guarantees, affected consumers, phase checks and rollback. Optimize the migration for that outcome rather than preserving throwaway internal shapes.

Temporary breakage is acceptable only inside authorized, isolated, reversible work with a declared boundary and recovery path. Keep shared branches, deployed systems and supported consumers usable. Use compatibility only where those real obligations require it.

Run high-signal checks as each phase closes. Resolve failed gates before building dependent work on them.

Finish with the relevant static, integration and runtime checks against the final artifact. Compilation is one result, not proof of ordering, cancellation or persistence. Report unfinished checks honestly; a tidy intermediate state is not the requested outcome.

Distinct from: `principle-sequence-verifiable-units` (ordering dependent changes into checked units), `principle-migrate-callers-then-delete-legacy-apis` (replacing an API and removing its transitional paths).

Done: the final artifact passes the relevant static, integration and runtime checks, and any unfinished check is reported.
