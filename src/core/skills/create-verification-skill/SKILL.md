---
name: create-verification-skill
description: "WHEN bootstrapping a reusable project verification recipe; NOT for routine runs or ongoing bundle maintenance; records indexed journeys, deterministic checks and cold-replay evidence"
---

# Create a verification skill

Create one shared `verify-<project>` bundle another agent can execute cold.
Authoring success, reproducibility and whole-product coverage are separate claims.
For an existing bundle, use `maintain-verification-skill`; preserve every supported
journey when handing over a refresh rather than creating a competing recipe.
Prefer one bundle per independently launched product, not a monorepo router.
A multi-surface product can share one bundle with explicit web/iOS journeys and
shared fixture ownership; do not split it merely because the platforms differ.
This task grants no implicit commit, push, PR, dependency-install or product-edit
authority.

## 1. Discover the project

Read project instructions, accepted requirements/examples, startup commands,
fixtures, authentication and existing interaction tools. Inventory every declared
surface and entry point, including web, iOS, CLI or API surfaces; do not silently
choose the easiest one. Record missing tools, credentials, devices or entitlements
as precise prerequisites, not permission to repair unrelated setup or product code.

Reuse existing runners and executable checks. Use companion skills when available:
`xcode-dev-loop` for Apple execution, `browser-testing` or `xcuitest` for test
authoring, and `visual-feedback` for interactive comparison. The saved bundle must
still include actual project commands, paths and required tool capabilities so
another host can run it without the author's installed skill library.

## 2. Choose one source and register it

Follow the project's canonical source and registration convention. Where none
exists, use `.agents/skills/verify-<project>/` for Codex and OMP when their installed
loaders support it, with a relative directory symlink under `.claude/skills/` for
Claude Code. Add a native `.omp/skills/` entry only if needed. When links are
unsuitable, generate copies mechanically from that source and check parity.
Never hand-author three recipes or overwrite conflicting user edits.

Keep `SKILL.md`, feature files and all relative resources together. Check every
declared discovery entry and resource separately from operational replay; matching
files or successful loading do not prove that a host can drive the product.
Keep the core recipe in portable commands with explicit inputs. Do not depend on
host-specific dynamic interpolation. Native entries are links or complete generated copies.

## 3. Establish identity and isolation

Record revision/build, an uncommitted-source fingerprint when the tree is dirty,
the intended installed/running artifact, fixture and relevant environment,
toolchain and recipe identity. A matching HEAD alone does not prove current inputs
were built. Reassess old evidence against every materially changed input.

Record owned instances and scratch state. One lifecycle owner drives a shared
instance serially; parallel drives require independent resources. Do not drive
the user's running instance. For Apple targets, resolve scheme, configuration,
bundle identifier, runtime/device, signing and entitlements. Never reset a shared
simulator or store to obtain a clean fixture.

## 4. Save an executable bundle

Include these sections, grounded in observed project commands, with no placeholders:

- **Launch:** prerequisites, isolated fixture setup and usable readiness, not merely
  an open port. Pin relevant browser/device/OS, locale, timezone, appearance and
  viewport. Reuse controlled clocks/randomness only at established test seams.
- **Doctor:** read-only checks of build, ownership, readiness and authentication.
  Run before driving and after anything surprising; restore a known owned state
  when a healthy process still has a wedged UI.
- **Drive:** actual public user actions and expected results. Prefer accessible
  selectors, bounded condition-based waits and native assertions over sleeps or
  coordinates. A deep link or internal setter can establish a precondition, not
  replace the claimed UI, Siri, widget, notification, purchase or other boundary.
- **Evidence:** the action, resulting state and relevant persistence/material side
  effects. Keep native structured reports, actual case IDs and selection inventory;
  exit zero, zero tests or a friendly log line cannot establish the intended run.
  Name durable artifact paths outside scratch, exclude secrets/customer data,
  qualify mocks and stand-ins, and observe what dry-run modes actually skip.
- **Cleanup:** success, error and cancellation release only currently owned resources.
  Recheck ownership beyond PID or process name before termination. Remove owned
  scratch, never evidence or unrelated data; confirm artifacts survive teardown.

Prefer existing runner commands. Add an executable helper only for an uncovered
repeatable operation, show its invocation and exercise its failure path. Do not
build a universal runner or a second result database.
Machine-checkable identity, selection reconciliation, provenance and aggregation
must have an executable command. Name the native report supplying each field;
add the smallest bundle-owned helper only for uncovered fields or decisions.
Do not leave a fresh agent to write metadata or decide case completeness by eye.
Never store authentication tokens in the bundle; redact fixtures, receipts and
shared evidence as well as screenshots.

## 5. Index the feature map

Create `features/README.md` and focused journey files using
[the bundle contract](references/bundle-contract.md). Each entry names a stable
journey ID, surface, required entry points and representative states, authority,
fixture, executable check/case reference or exact interaction recipe, expected
observable result, evidence and gotchas.

Link existing accepted BDD examples and test cases at their authoritative paths;
do not copy their expectations into SKILL.md, feature prose and another assertion
catalogue. For an accepted journey with no executable check, record its exact
preconditions, actions, expected result and authority, explicitly unverified.
Authoring shared product tests needs its own grant. An ordinary and a deep-link
entry are distinct obligations unless the contract says otherwise.
Label exact agent-driven recipes separately from exploratory inspection. When a
stable repeated journey warrants automation, propose promotion into the existing
test suite under a separate authoring grant; link its case ID after that change.

## 6. Make the result rules explicit

Before execution, record every repository/user/contract mandatory gate and the
selected risk-relevant checks and exclusions. A convenient smoke profile cannot
omit a mandatory migration, surface or evidence requirement.

Record `pass`, `fail`, `blocked` or `not-run` per obligation and every attempt.
Prefer machine assertions and native reports; fail aggregation when any required
obligation failed, did not run, lacked current identity or required evidence, or
cleanup/evidence retention failed. An unexplained fail-then-pass remains unresolved,
not a clean pass. A retry must have an evidenced setup cause or declared runner
policy and must never erase an earlier behavioural failure.
Reconcile actual native case IDs/outcomes against the selected expected inventory,
including missing, filtered, skipped and duplicate cases, before aggregation.

Use a small receipt only for provenance missing from native reports: scope and
authority, inputs/build/dirty identity, environment/fixture/tool/recipe identity,
case IDs, attempts, evidence level and paths, mocks/limits, cleanup and retention.
Keep raw execution results separate from `acceptance-review`'s requirement verdict.

## 7. Execute, then cold-replay

Select one authorised current critical journey. Run launch → doctor → drive →
evidence → cleanup, save corrections, and confirm evidence survives. Reset only
owned fixtures, then have a fresh agent replay the saved bundle using only its
documented prerequisites. The authoring run cannot substitute for this replay.
Unavailable or failed execution/replay leaves a draft with precise proof gaps.

Before claiming cross-harness support, prove native discovery and representative
real web and real iOS cold replay separately in each host for which those surfaces
are claimed. Do not substitute a simulator for a physical-device/system boundary.
Unavailable matrix cells remain unproven; do not install tools or change credentials
implicitly.

## 8. Hand over bounded proof

Link the bundle and retained evidence. Report authoring and cold-replay outcomes,
the exact journeys/entry points/states exercised, and every uncovered or unavailable
boundary. A bounded bootstrap may leave other inventoried journeys outside its
execution scope: label them unverified, never call the whole product verified.
Keep unit, integration, browser, simulator, device and deployed evidence distinct.
Use `maintain-verification-skill` for the subsequent full upkeep pass.

For a plan-only response, use this handoff checklist rather than a generic assurance:

- **Before execution:** record selected obligations, mandatory gates, exclusions and unverified map entries before running a check.
- **Execution:** actual expected/native case inventory, all attempts and executable result aggregation.
- **Replay:** separate authoring from a fresh agent using only documented prerequisites; reset only owned fixtures before it.
- **Lifecycle:** owned cleanup on success, failure and cancellation, evidence survival; a failed replay remains unverified.
- **Maintenance:** hand over to `maintain-verification-skill` for every declared feature, required entry point and representative state, not just the bootstrap's selected checks.
