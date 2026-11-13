# Running the lenses

Read this before step 4. Pick the section for the host. Each runtime applies the merge and verification rules from step 5 of `SKILL.md`.

## Claude Code: the Workflow tool

A user who invokes this skill has opted in to the `Workflow` tool. Build each lens brief inline from the roster, and pass the briefs and the verifier brief in `args` as real JSON values, not as a string.

The verifier brief holds the refute mandate, the base and head refs, and the three review checks from step 5. The script adds one finding to it: the claim and its evidence, never the lens's brief or reasoning.

```js
export const meta = {
  name: 'lens-review',
  description: 'Run review lenses in parallel, then verify each unique finding',
  phases: [{ title: 'Lenses' }, { title: 'Verify' }],
}

const FINDINGS = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' }, title: { type: 'string' },
          severity: { enum: ['critical', 'major', 'minor', 'nit'] },
          file: { type: 'string' }, line: { type: 'integer' },
          evidence: { type: 'string' }, why_it_matters: { type: 'string' },
          suggestion: { type: 'string' },
          confidence: { enum: ['high', 'medium', 'low'] },
          preexisting: { type: 'boolean' },
        },
        required: ['id', 'title', 'severity', 'file', 'evidence', 'why_it_matters'],
      },
    },
    clean: { type: 'array', items: { type: 'string' } },
    not_assessable: { type: 'array', items: { type: 'string' } },
  },
  required: ['findings', 'clean', 'not_assessable'],
}

const VERDICT = {
  type: 'object',
  properties: {
    verdict: { enum: ['confirmed', 'refuted', 'unverifiable'] },
    reason: { type: 'string' }, evidence: { type: 'string' },
  },
  required: ['verdict', 'reason'],
}

// args = { lenses: [{ name, brief }], verifierBrief: '<refute mandate, refs, review checks>', votes: 1 | 3 }
phase('Lenses')
const reports = (await parallel(args.lenses.map(l => () =>
  agent(l.brief, { label: `lens:${l.name}`, phase: 'Lenses', schema: FINDINGS })
    .then(r => r && { ...r, lens: l.name })
))).filter(Boolean)
const lost = args.lenses.map(l => l.name).filter(name => !reports.some(r => r.lens === name))
if (lost.length) log(`${lost.length} of ${args.lenses.length} lenses returned nothing: ${lost.join(', ')}`)

// Barrier: merging needs every report before verification spends tokens.
// ponytail: exact file:line:title merge; the orchestrator merges same-claim findings with different titles in the report.
const merged = new Map()
for (const r of reports) for (const f of r.findings) {
  const key = `${f.file}:${f.line ?? 0}:${f.title.toLowerCase().slice(0, 40)}`
  const prev = merged.get(key)
  if (prev) prev.lenses.push(r.lens)
  else merged.set(key, { ...f, lenses: [r.lens] })
}

phase('Verify')
const claim = f => ({ title: f.title, file: f.file, line: f.line, evidence: f.evidence, why_it_matters: f.why_it_matters, lenses: f.lenses })
const verified = (await parallel([...merged.values()].map(f => () =>
  parallel(Array.from({ length: args.votes }, (_, i) => () =>
    agent(`${args.verifierBrief}\n\nFinding to refute:\n${JSON.stringify(claim(f))}`, {
      label: `verify:${f.id}${args.votes > 1 ? `#${i + 1}` : ''}`, phase: 'Verify', schema: VERDICT,
    })
  )).then(votes => {
    const vs = votes.filter(Boolean)
    const yes = vs.filter(v => v.verdict === 'confirmed').length
    const no = vs.filter(v => v.verdict === 'refuted').length
    return { ...f, verdict: yes > no ? 'confirmed' : no > yes ? 'refuted' : 'unverifiable', votes: vs }
  })
))).filter(Boolean)

return {
  confirmed: verified.filter(f => f.verdict === 'confirmed'),
  refuted: verified.filter(f => f.verdict === 'refuted'),
  unverifiable: verified.filter(f => f.verdict === 'unverifiable'),
  clean: reports.flatMap(r => r.clean.map(area => ({ lens: r.lens, area }))),
  notAssessable: reports.flatMap(r => r.not_assessable.map(gap => ({ lens: r.lens, gap }))),
  lost,
}
```

Script rules:

- Keep `meta` a pure literal. Write plain JavaScript, with no type annotations.
- Do not call `Date.now()`, `Math.random()` or `new Date()` without arguments. They break resume.
- An agent that fails resolves to `null`. The script filters it out and reports it in `lost`.

Write the report from the returned object. Do not let the script write it.

## Sub-agents without a workflow tool

Use this for OMP, or when Claude Code has no `Workflow` tool.

1. Launch every lens as a sub-agent in one message, so that they run in parallel. End each brief with: "Your final message must be only the findings JSON."
2. Retry a lens with malformed output once. Then record it as lost.
3. Merge the findings yourself.
4. Launch one verifier sub-agent for each unique finding, in one message. With `thorough`, launch three for each finding.

## Codex: threads or sub-agents

The lenses do not write, so they need no worktrees.

1. Open one fresh thread or sub-agent for each lens. Send its brief as the opening message. Require the final message to be only the findings JSON.
2. Retry a lens with malformed output once. Then record it as lost.
3. Merge the findings in the coordinator.
4. Open one fresh thread or sub-agent for each unique finding, with the verifier brief and the claim. Never use a lens's thread as its verifier.
5. Archive each thread after you read its JSON.

## No sub-agents

Run each lens yourself, one after another, and write its findings to a file before you start the next lens. Your verification is not independent, because the same context wrote the findings. Label the report `sequential (degraded): not independent`.
