# Project verification bundle contract

Use the project's existing layout when one exists. Otherwise keep these resources
inside the canonical `verify-<project>` directory:

- `SKILL.md`: launch, doctor, drive, evidence, cleanup and result rules.
- `features/README.md`: declared surfaces, required coverage and links to journeys.
- `features/<journey>.md`: one user-facing journey or coherent feature group.
- Optional references and executable helpers, only when existing project tooling
  does not already supply the operation.

Angle-bracket names here describe authoring slots, not commands to leave in the
generated bundle. Replace every slot with observed project facts.
Prefer one bundle per independently launched product, not a combined monorepo router.
A multi-surface product can share one bundle with explicit web/iOS journeys and
shared fixture ownership.
Core commands use explicit portable inputs, not host-specific dynamic interpolation.
Native entries are links or complete generated copies. Tokens never belong in bundle resources.

## Feature entry

Record:

1. Stable ID and user-visible purpose.
2. Authority: accepted requirement/example and source locator. Current output alone
   is not an oracle. Link executable BDD/test cases instead of copying expectations.
3. Surface, every required entry point and representative state.
4. Prerequisites and isolated fixture ownership.
5. Exact existing command/case IDs or public actions paired with observable results.
6. Evidence: action, resulting state and material side effects, with durable paths.
7. Known limitations, unavailable boundaries and cleanup.

An uncovered accepted journey needs its explicit preconditions, actions and expected
result. Record it as unverified until executed. Do not delete a blocked journey or
replace a public boundary with an internal setter. Retiring coverage requires
intended-removal evidence.

## Identity and reproducibility

Record build/revision plus the fingerprint of relevant uncommitted inputs, the
actual running/installed artifact, fixtures, environment and tool/recipe versions.
Bind every result to that identity. A source commit is insufficient when a local
build omits dirty changes. Reassess cached evidence when relevant inputs change.

For mobile, include scheme/configuration, bundle identifier, runtime/device,
permissions, signing and entitlements. For web, include URL, owned server identity,
browser, viewport, appearance and relevant locale/font conditions.

## Result and evidence

Reuse native reports and name which field/command supplies each recorded fact.
Provide an executable provenance writer and fail-closed aggregation/selection
check where native tooling does not supply them. Do not require a fresh agent to
invent a writer or judge machine-checkable completeness from prose. Add only the
smallest project-owned helper; do not introduce a universal report framework.
Add a small receipt only for missing provenance:

- Selected obligations, authority, mandatory gates and explicit exclusions.
- Actual executable check/case IDs and expected selection inventory.
- Input/build/fixture/environment/tool/recipe identity.
- Actions, all attempts, raw per-obligation result and evidence level.
- Native report/trace/capture paths, relevant effects, mocks and limits.
- Owned resources, cleanup outcome and evidence-survival confirmation.

Use `pass`, `fail`, `blocked` and `not-run` for execution states. An aggregate pass
requires all mandatory obligations to run and pass with valid identity and required
evidence. Zero cases, missing traces, failed cleanup and unresolved behavioural
failures prevent a pass. Preserve retries and failures; a successful last attempt
cannot erase them. Do not conflate this with an acceptance or design-quality verdict.

## Three harnesses

Keep one source. Validate each declared host's discovery entry and complete relative
resources. Relative directory links are preferable where supported; generated copies
must match the source and must not overwrite conflicting user work. Source parity
and loading are separate from a real fresh-context replay in each claimed host and
platform. Record missing cells rather than extrapolating from one host.

The recipe must include executable project facts even when optional companion
skills or interaction tools are absent. Record the missing capability precisely;
do not install a tool, repair credentials or change product code implicitly.
