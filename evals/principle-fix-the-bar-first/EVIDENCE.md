# Evaluation evidence: principle-fix-the-bar-first

Date: 19 October 2026. Subject and judge: `gpt-6-astra`, reasoning effort medium, via the Codex SDK provider (read-only). One trial per case per run unless stated. Config dir: `.promptfoo/fix-the-bar-first`. These are instruction-quality scenarios, not executed product behaviour. Provider errors: none in any run recorded here.

## Behaviour (`pnpm eval:skills`)

Final run `eval-QPg-2026-10-19T11:06:17`: baseline 1/3, treatment 3/3.

| Case | Baseline | Treatment |
|---|---|---|
| Criteria proposed after results are not the bar | fail (did not state that results were seen before the bar was fixed) | pass |
| An iteration loop keeps its declared bar | pass | pass |
| A candidate cannot define its own bar | fail (answered yes against the author's own criteria) | pass |

Treatment repeat of "A candidate cannot define its own bar" with `--repeat 3`: 3/3 (`eval-iGh-2026-10-19T11:07:46`). Grader variance: in the earlier run `eval-G0Q-2026-10-19T11:04:56` both arms opened with a qualified "yes"; the judge failed the baseline and passed the treatment. Step 2 then gained "when no independent bar exists, withhold the verdict and ask for one".

History: `eval-GRM-2026-10-19T11:00:22` baseline passed both original cases. `eval-1Zf-2026-10-19T11:01:47`: the iteration scenario omitted round 1's score (scenario fixed); a logo tie-break case was dropped because both arms failed on tie resolution, which the plan does not cover. `eval-Dr1-2026-10-19T11:03:29`: a race-planning case passed the baseline and was replaced.

## Triggers (`pnpm test:skills:triggers`, report-only)

`eval-LfL-2026-10-19T11:08:13`: 2/2 (skill-used on a library comparison; not-skill-used on a staging fix check).
