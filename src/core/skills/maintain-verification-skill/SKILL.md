---
name: maintain-verification-skill
description: "WHEN auditing or refreshing an existing project verification bundle and its harness discovery; NOT for bootstrapping, routine execution or product fixes; repairs owned recipes and reports full coverage honestly"
---

# Maintain a verification skill

Keep an existing `verify-<project>` bundle accurate and executable. Maintain one
canonical recipe and every supported OMP, Claude Code and Codex discovery entry,
not three independently authored versions. Creation belongs to
`create-verification-skill`; test authorship belongs to the relevant testing skill.

## 1. Fix scope and ownership

Find the canonical bundle, feature index, owned helpers/fixtures and declared host
registrations. Resolve candidates from the named product and repository context;
ask only if the target remains ambiguous. With no existing bundle, route to the
creator rather than silently inventing one.

Edit only verification-owned instructions, helpers, fixtures and registrations
within the grant. Product code and linked shared acceptance tests remain outside
maintenance ownership. Do not commit, push, open a PR or change machine/account
setup without separate authority. A maintenance invocation does not inherit
`ship-pr` or `babysit` permissions.

## 2. Reconcile coverage and authority

Read the index and actual feature files. Repair missing, duplicate or stale index
links. Account for every declared feature, required entry point and representative
state; one ordinary populated-state route does not prove a deep link or empty state.
Inspect current sources and relevant changes for additional user-facing surfaces,
with concrete source locators before calling coverage missing.

Use accepted requirements/decisions to distinguish instruction drift from a product
regression. Current source is implementation evidence, not authority to change an
expectation. Repair an instruction only with evidence of the intended behaviour.
Preserve failing obligations and report product regressions; do not rewrite shared
test expectations or remove journeys to match broken output. Coverage retirement
requires intended-removal evidence. For ambiguous authority, mark dependent claims
unverified and continue reachable work.

Link existing BDD examples/test case IDs at their authoritative paths instead of
copying expected outcomes into another assertion catalogue. Repair of a linked
shared test needs a separate authorised authoring task.

## 3. Reconcile every harness entry

Check all registered projections, links and complete relative resources against the
canonical source. Repair safely owned broken links or generated-copy drift; preserve
conflicting user edits rather than overwriting or choosing a winner silently.
Prefer supported directory links; use deterministic parity checks for generated
copies. Do not add a native OMP duplicate when Agents discovery already suffices.

Loading/parity is not operational equivalence. Check native discovery and cold
operational replay for materially affected host/platform paths. Reassess the validity
of unaffected evidence explicitly. A missing tool/auth/device or conflicted projection
leaves its cell unproven, not verified through another host. Saved commands must work
without assuming the author's optional companion-skill installation.
Keep core commands portable with explicit inputs. Do not depend on host-specific
dynamic interpolation or store tokens in the bundle. Native entries are links
or complete generated copies, with the parity checks above.

## 4. Run the declared maintenance coverage

Source inspection never substitutes for the live pass. Before execution, record all
repository/user/contract mandatory gates, selected risk-relevant checks and exclusions.
A smoke profile cannot omit a required migration or surface. Use existing runners,
structured reports and actual expected case IDs/selection inventory. Exit zero with
zero selected tests is not a pass.

Record revision/build, relevant dirty-source fingerprint, the actual installed or
running artifact, fixture/environment/toolchain/recipe identity and required artifact
paths. A matching HEAD or old clean-tree receipt cannot verify a stale process against
current uncommitted changes. Reassess evidence whenever these inputs change.

Follow the bundle's launch model with one lifecycle owner for shared instances and
independent resources for parallel drives. Doctor checks identity, ownership, usable
readiness and auth read-only before driving and after any surprising result. Restore
a known owned state or relaunch when a healthy process has a wedged UI.

Exercise every declared required entry point and representative state through the
public boundary, checking resulting state and relevant persistence/side effects.
Mark unreachable auth, entitlement, device or external-state prerequisites `blocked`,
with the route attempted and exact missing prerequisite. Never call them passes.

## 5. Repair and re-prove narrowly

Classify each discrepancy:

- **Instruction/registration drift:** correct it using source and intended-behaviour
  evidence. Re-run the affected procedure and host path before claiming repair.
- **Verification-owned helper/fixture gap:** repair only that owned mechanism without
  weakening the expected outcome. A helper must be executable and its invocation
  documented. Re-drive its real path, including the failed setup/cleanup boundary.
- **Product or shared-test failure:** retain the obligation and evidence; hand it to
  `debug` or the appropriate implementation/test-authoring workflow. Do not repair
  it under this grant or broaden the grant merely to obtain a green summary.

Record every attempt. A diagnosed setup fault or declared runner policy may justify
bounded retry, but never erase a behavioural failure or label unexplained fail-then-pass
clean. Do not loosen assertions, baselines or tolerances until green.

On success, error and cancellation, release only currently owned resources/scratch.
Check ownership beyond a reused PID/process name. Never kill the user's server or
reset a shared simulator/store. Keep proof outside cleanup targets, exclude secrets
and customer data, and confirm retained evidence survives every teardown.

## 6. Report without hiding gaps

Reuse native reports plus a small receipt for missing provenance: scope/authority,
identity, case IDs, attempts, per-obligation results, evidence level/paths, limits,
cleanup and retention. Report `pass`, `fail`, `blocked` or `not-run` per obligation.
An aggregate pass requires every mandatory obligation to run and pass with valid
identity, required evidence and successful cleanup/retention. A missing trace, zero
cases, omitted gate or unresolved failed attempt prevents a pass.
Verify that the saved commands actually compute machine-checkable provenance,
case-selection reconciliation and aggregation, using named native report fields
or the smallest existing/bundle-owned helper. A prose instruction to invent a
writer is a recipe defect, not a reproducible step. Redact fixtures and receipts.

Report the maintenance outcome separately from execution:

- **Clean:** full declared coverage and registrations were checked; no correction needed.
- **Changed:** verification-owned corrections were made and re-proved; name any other
  failing/blocked obligations explicitly. Changed does not mean the product passed.
- **Blocked:** required coverage or safe correction could not finish; state what is missing.

Link corrected files and retained evidence. List every feature/entry/state and host
path covered, product defects and remaining prerequisites. Keep browser, simulator,
physical-device and deployed evidence distinct. This is neither an
`acceptance-review` requirement verdict nor permission to publish a PR.

For a plan-only response, make the handoff executable: name the documented
commands/case selections, or the discovery step that resolves them when unknown.
Include the pre-execution mandatory-gate/exclusion record and cleanup on success,
failure and cancellation explicitly. Report each unavailable path rather than
relying on generic statements that the recipe will be followed.
