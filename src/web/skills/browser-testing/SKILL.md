---
name: browser-testing
description: WHEN authoring or repairing real-browser journeys or automated screenshot comparisons with the project's selected runner; NOT DOM-only tests, interactive visual judgement or verification-recipe maintenance; provides native-runner fixtures, assertions and visual-comparison guidance.
---

# Author Reliable Real-Browser Regression Tests

Use the project's existing browser suite to assert observable behaviour across
real navigation, cookies, authentication, popups, downloads and rendering.
Reuse the browser runner already selected by the repository. Do not install
another runner, optional query plugin or image engine merely to follow this skill.
Playwright and Cypress examples below show concrete APIs, not a portable API.
For another runner, inspect its installed version, project conventions and actual
documentation/APIs; adapt the same behavioural rules without switching frameworks.
Report unrun integrations as unverified, not as proof.

## Scope and authority

- `tdd` owns RED–GREEN–REFACTOR. This skill supplies browser-specific assertions,
  fixtures and diagnostics; it does not replace failing-before/passing-after proof.
- DOM-only component tests belong to `frontend-testing` or `react-testing`.
  jsdom does not prove cross-document redirects, real cookie delivery, downloads,
  tabs or painted layout. Mocking `fetch`, `window.open` or an auth callback cannot
  prove those boundaries either.
- Interactive visual judgement belongs to `visual-feedback`. Authoring an image
  comparison does not grant authority to approve its baseline or a design change.
- The generated `verify-<project>` recipe runs existing checks and records
  evidence. Maintaining that recipe belongs to `maintain-verification-skill`,
  not to browser-suite repair. Requirement approval belongs to its named owner;
  `acceptance-review` assesses satisfaction against that authority.

Only change the authorised suite, fixtures and execution configuration. Discover
actual scripts, configuration, installed runner/version, support commands,
fixture ownership and baseline policy before proposing runnable code. For a
scenario-only request, use the supplied facts and label code as proposed; never
invent repository paths, helper APIs, credentials or execution results.

## Define the boundary before the test

1. Link the case to its agreed requirement and expected outcome. Name the real
   browser/server/service boundaries it must cross and any deliberate stand-ins.
2. Reuse the suite's launch and readiness commands, test accounts, seed/reset
   fixtures and CI report conventions. A listening port alone is not readiness.
3. Select a positive outcome and a discriminating failure. A successful click,
   optimistic input value or request being sent is not proof of persisted data.
4. Keep relevant dependencies real. Seed data at an existing fixture seam when
   that is only a precondition; never bypass the sign-in, save, cookie or download
   boundary the case claims to verify. Record external services not exercised.

## Isolate browser state and owned fixtures

Playwright Test's built-in `page`/`context` fixtures normally give each test a
fresh browser context. Inspect overrides and `storageState`: a fresh context can
still start authenticated. For a sign-in case, explicitly use empty storage
state and the disposable user's actual sign-in flow. For other cases, an existing
per-user auth fixture or Cypress `cy.session` is a precondition, not sign-in proof.
Never borrow an admin session to test an ordinary user's authentication.

Give each test its own record/account scope using existing factories and unique
identifiers. Per-worker accounts do not justify sharing a mutable record such as
project 42. Do not serialise independent workers to conceal shared-fixture races.
Use fixture teardown or `try`/`finally` to remove only records, contexts, popups
and scratch files created by that test, including after assertion failure.
Retain diagnostics outside scratch directories before cleanup.

In Cypress, preserve `testIsolation` and the existing per-test seed/reset tasks.
Validate cached sessions under the project's convention, visit the starting page
after session restoration, and reset server-side data independently of cookies.
Account for application-owned IndexedDB/service-worker state when relevant;
clearing cookies alone is not a complete fixture reset. Never wipe shared data.

## Query meaning, wait for outcomes

Prefer actual roles and accessible names, then labels, then established stable
test IDs where semantics cannot identify the target. Scope to the intended row,
dialog or region. Do not invent accessible names: an unnamed `status` needs a
role query plus a text assertion, not a fictitious `name`. Avoid row positions,
generated classes and coordinates. Accessible queries are not an accessibility
audit or proof of keyboard/screen-reader compliance.

Use Playwright's locator actions and auto-retrying `expect` assertions, or
Cypress's retrying query/`.should()` chains. Let normal actionability checks run;
do not force a click to bypass an unexplained overlay or disabled control.
Keep actions out of retrying assertion callbacks and re-query after navigation
or a DOM replacement.

Replace sleeps, broad `networkidle` waits and polling loops with the specific
bounded observable outcome: returned URL, saved status, rendered result or
matching server response. Register response/event waits before the action.
Choose a timeout from the known operation budget; do not inflate global timeouts
or retry the whole test to conceal a race. An absence assertion needs a completion
anchor so it cannot pass before the operation starts.

For persisted changes, wait for real save completion, then reload or navigate
away/back and assert the independently loaded value. If the requirement is an
external side effect, assert it using the existing independent observer, for
example the test payment ledger, not just a success toast.

### Playwright: isolated persisted rename

Representative callback using the scenario's existing `projectFactory` and
per-worker `ownerId` fixtures. For this example, the authenticated `page` fixture
opens the existing project-list route; retain the repository's actual navigation
and fixture import. These are not built-in Playwright fixture names. The supplied
markup has named rows and a status named Saved.

```ts
import { randomUUID } from 'node:crypto';
// `test` is the existing extended test; `expect` is from @playwright/test.
test('rename persists after reload', async ({
  page, projectFactory, ownerId,
}) => {
  const before = `Project ${randomUUID()}`;
  const after = `Renamed ${randomUUID()}`;
  const project = await projectFactory.create({ ownerId, name: before });
  try {
    await page.reload(); // Load the newly created fixture in the existing list.
    const row = page.getByRole('row', { name: before, exact: true });
    await row.getByRole('button', { name: 'Rename project', exact: true }).click();
    await page.getByLabel('Project name', { exact: true }).fill(after);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByRole('status', { name: 'Saved', exact: true }))
      .toBeVisible();
    await page.reload();
    await expect(page.getByRole('row', { name: after, exact: true }))
      .toBeVisible();
  } finally {
    await projectFactory.remove(project.id);
  }
});
```

This is a test-body pattern, not a standalone suite: retain the actual existing
navigation and imports. The default bounded assertion budget can accommodate a
supplied 100–1800 ms save when configured accordingly; a 500 ms sleep cannot.
If Saved already exists before clicking, observe a fresh operation-specific
completion signal instead of accepting stale status. Do not assume an optimistic
input or unchanged old toast proves persistence.

## Exercise real authentication and browser events

For a cross-origin sign-in case, start unauthenticated, visit the protected
route, follow the actual redirect to the supplied local identity service, enter
the disposable account's credentials and complete its callback. Assert the
intended return URL and account identity with bounded assertions. Inspect
`await context.cookies(appURL)` for the actual named session cookie and assert
its `httpOnly` flag and the required domain/path/security attributes. Do not
inspect HttpOnly cookies via `document.cookie` or print their values. Reload
and assert the account remains signed in. This proves the local browser/service
integration only, not a live provider or production deployment.

For a popup and attachment, register each event on the correct page before the
trigger. A representative Playwright fragment assumes the supplied finance-user
context is already on invoice 704, and `scratchDir` is the existing uniquely
owned download fixture. The page headings/route must match the actual app:

```ts
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const popupPromise = page.waitForEvent('popup');
await page.getByRole('link', { name: 'Receipt', exact: true }).click();
const receipt = await popupPromise;
try {
  // Query the actual receipt's identity, not just an arbitrary new tab.
  await expect(receipt.getByRole('heading', { name: 'Invoice 704', exact: true }))
    .toBeVisible();
  const downloadPromise = receipt.waitForEvent('download');
  await receipt.getByRole('button', { name: 'Download CSV', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('invoice-704.csv');
  const file = join(scratchDir, 'invoice-704.csv');
  await download.saveAs(file);
  expect(await download.failure()).toBeNull();
  const csv = (await readFile(file, 'utf8')).replace(/\r\n/g, '\n');
  expect(csv.trimEnd()).toBe('invoice,total_gbp\n704,19.50');
} finally {
  await receipt.close();
}
// Exercise the original page again, rather than merely checking it is open.
const reopenedPromise = page.waitForEvent('popup');
await page.getByRole('link', { name: 'Receipt', exact: true }).click();
const reopened = await reopenedPromise;
try {
  await expect(reopened.getByRole('heading', {
    name: 'Invoice 704', exact: true,
  })).toBeVisible();
} finally {
  await reopened.close();
}
```

The code illustrates supported APIs, not undiscovered application markup:
Receipt may be a button rather than a link, and invoice identity may use another
visible element or route. Inspect and use that real query. Opening the receipt
again exercises the original page after the download. Preserve the scratch
fixture's cleanup and copy required failure evidence before the context or
fixture deletes downloads.

## Keep Cypress when Cypress is selected

Repair the existing e2e test with its `cy.session` convention and per-test
seed/reset tasks; do not introduce Playwright. Cypress core does not supply
`cy.findByRole`/`cy.findByLabelText`. Use those only if the suite already installs
Cypress Testing Library. Otherwise use supported `cy.contains('button',
/^Update address$/)`, actual labelled input associations or existing stable
selectors, scoped with `.within()` where needed. Inspect markup rather than
assuming that a label is an `aria-label` attribute.

For an address update: create/reset that test's address data, restore its own
user session, visit the form, fill the supplied labelled fields, click Update
address normally, and use `.should()` on the meaningful success state. Then
navigate away/back to checkout and use a fresh bounded assertion on the summary's
new address. A form-exists assertion is insufficient. If a matching real request
is useful, register `cy.intercept(method, route).as('save')` before clicking and
`cy.wait('@save')` afterwards; do not supply a stub response for the save boundary.
Assert the rendered persisted result as well as the response. Do not use
`cy.wait(2000)`, forced clicks or repeated whole-test attempts as synchronisation.

Use `cy.origin` where the installed Cypress version requires it for real
cross-origin interaction. Cypress does not expose Playwright's popup/context API:
reuse existing supported project mechanisms and state any unsupported multi-tab
proof explicitly. A stubbed `window.open` call or removing `target` is not proof
that real multi-tab session behaviour works. A new runner requires explicit
project authority, not a silent workaround.

## Make automated screenshot comparisons diagnostic

Reuse the project's established comparison engine. Playwright Test provides
`await expect(page).toHaveScreenshot('checkout.png')`; Cypress's `cy.screenshot`
is capture, not a built-in image comparison assertion. Use the existing Cypress
snapshot integration if present; adopting an engine is a separate project choice.

Pin the browser revision, OS/container and render mode used for the reviewed
baseline, viewport/device scale, locale, timezone and colour scheme. For example,
Playwright context options include `viewport: { width: 1280, height: 800 }`,
`locale: 'en-GB'`, `timezoneId: 'Europe/London'` and `colorScheme: 'light'`.
Those options alone do not pin browser, OS or fonts. Use bundled/pinned fonts,
wait for `document.fonts.ready` and verify the intended font actually loaded;
a resolved font promise can still leave fallback fonts. Wait for meaningful
page readiness and required images. Control promotion data, time, randomness
and animations through the project's existing test seams and agreed policy,
without hiding the feature under test.

On a mismatch, retain the approved expected image, actual image and diff with
the case's render conditions. Reproduce under the same pinned environment and
separate environment drift, unstable fixtures and a product regression. A clipped
total remains a defect against a baseline that shows the full total. Do not
increase `maxDiffPixelRatio`, broaden masks, crop the total, suppress failures or
run `--update-snapshots` until green. Existing masks/tolerances must have reviewed,
bounded justification and cannot conceal the behaviour being checked.

Baseline creation/replacement requires the authorised owner's review under the
project policy. Record the intended change, comparison evidence and approval;
generation of an image does not approve it. Automated diffs do not judge design
quality, and interactive taste cannot override a machine assertion silently.

## Retain honest, secrets-safe execution evidence

Reuse runner-native JSON/JUnit/HTML reports and the existing CI commands. Before
claiming coverage, compare the expected case inventory with actual test IDs,
projects/browsers, shard selection and outcomes. In Playwright, `test --list` can
help inventory selection; it does not prove execution. An exit code of zero,
empty report, skipped case or one friendly log line is not a suite pass.
Preserve the exit status and reconcile missing, filtered, skipped, failed and
blocked required cases. Do not replace native results with a model verdict.

Keep revision/dirty-tree identity, runner/browser/environment and fixture
identity, selected cases, attempt numbers, outcomes and artifact locations.
Use existing bounded retry policy only; never add rerun-until-green loops,
delete early failures or reset state repeatedly until an assertion passes.
A fail-then-pass remains flaky, not a clean pass. A duplicate charge on attempt 1
remains an unresolved behavioural failure even if attempt 2 passes after reset.
Diagnose the failed boundary without weakening the one-charge assertion.

Use the runner's trace/video/screenshot capabilities under its retention policy.
In Playwright, `trace: 'retain-on-failure'` can retain failed attempts;
`trace: 'on-first-retry'` alone does not capture the original failed attempt.
Preserve the first failure's report and available evidence, and adjust future
capture policy when needed without inventing a missing trace or erasing history.
Keep useful failed-attempt evidence access-controlled with limited retention.
Traces can contain request cookies, Authorization headers, customer addresses,
DOM snapshots and response bodies. Never publish the raw sensitive trace.
Use disposable data and remove/redact sensitive material before sharing; if
reliable trace sanitisation is unavailable, share a checked, sanitised extract
and keep the original restricted. Treat screenshots, videos and auth state files
as sensitive too; never commit tokens, passwords or storage-state secrets.

Report only observed execution: cases/attempts and their actual pass/fail/
blocked/not-run status, retained evidence, cleanup outcome and the exact boundary
proved. Scenario proposals are not runs. Missing browser, credentials, service,
engine or required evidence is a stated gap, not a pass. Executing project checks
requires the task's execution authority; authoring alone does not imply a run.

## Runner API references

- [Playwright downloads](https://playwright.dev/docs/downloads)
- [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots)
- [Cypress test isolation](https://docs.cypress.io/app/core-concepts/test-isolation)
- [Cypress retrying assertions](https://docs.cypress.io/app/core-concepts/retry-ability)
