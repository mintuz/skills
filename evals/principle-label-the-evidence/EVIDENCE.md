# Evaluation evidence

Date: 2026-10-19. Subject and judge: `gpt-6-astra`, reasoning effort medium, via `openai:codex-sdk` with the installed `codex` (read-only sandbox, no network). One trial per case. Synthetic read-only scenarios test instruction behaviour, not product runtime. Provider errors: none in any run below.

## Behaviour (`pnpm eval:skills`)

| Case | Baseline | Treatment |
| --- | --- | --- |
| Lower-level passes do not establish a device claim | pass | pass |
| Mark an investigation's claims by epistemic status | **fail**: described pool exhaustion as "weakened" rather than a rejected hypothesis | pass |

Run: `eval-gvG-2026-10-19T10:53:18` (RED 1/2 baseline failures; GREEN 2/2 treatment).

The device case carries the evidence-level rule moved out of `principle-prove-it-works`; the investigation case carries the status-and-locator rule moved out of `principle-guard-the-context-window` step 2.

## Trigger (`pnpm test:skills:triggers`, report-only)

`eval-Uoi-2026-10-19T10:54:40`: 2/2. Handover findings request → `skill-used` pass; plain French translation → `not-skill-used` pass.
