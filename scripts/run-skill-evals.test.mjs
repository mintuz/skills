import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync, readdirSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, delimiter } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const runner = fileURLToPath(new URL("run-skill-evals.mjs", import.meta.url));
function useNativePromptfoo(root) {
  const packagePath = new URL("../node_modules/promptfoo/package.json", import.meta.url);
  const manifest = JSON.parse(readFileSync(packagePath, "utf8"));
  const cli = fileURLToPath(new URL(manifest.bin.promptfoo, packagePath));
  rmSync(join(root, "bin/promptfoo"));
  symlinkSync(cli, join(root, "bin/promptfoo"));
}

function fixture(run) {
  const root = mkdtempSync(join(tmpdir(), "skill-trigger-"));
  const source = join(root, "src/principle/skills/principle-fixture");
  const suite = join(root, "evals/principle-fixture");
  const target = join(suite, "workspace/.agents/skills/principle-fixture");
  const config = join(suite, "trigger.promptfooconfig.yaml");
  const bin = join(root, "bin");
  try {
    for (const dir of [join(source, "references"), target, bin]) mkdirSync(dir, { recursive: true });
    writeFileSync(join(source, "SKILL.md"), "---\nname: principle-fixture\ndescription: Use the reference.\n---\nRead [contract](references/contract.md).\n");
    writeFileSync(join(source, "references/contract.md"), "Keep the caller contract.\n");
    writeFileSync(join(target, "stale.md"), "Removed source guidance.\n");
    writeFileSync(config, "providers:\n  - config:\n      working_dir: ./workspace\n");
    writeFileSync(join(suite, "promptfooconfig.yaml"), "providers: []\n");
    writeFileSync(join(bin, "promptfoo"), '#!/bin/sh\nprintf "%s\\n" "$@" >> "$CALL_LOG"\n', { mode: 0o755 });
    let invocation = 0;
    const invoke = (mode = "trigger", name = "principle-fixture") => spawnSync(process.execPath, [runner, mode, name], {
      cwd: root, env: { ...process.env, PATH: bin + delimiter + process.env.PATH, CALL_LOG: join(root, "calls"), PROMPTFOO_CONFIG_DIR: join(root, `store-${invocation++}`), PROMPTFOO_DISABLE_UPDATE: "1", PROMPTFOO_FAILED_TEST_EXIT_CODE: "100" }, encoding: "utf8",
    });
    run({root, source, suite, target, config, invoke});
  } finally { rmSync(root, { recursive: true, force: true }); }
}

function snapshotTree(root) {
  return Object.fromEntries(readdirSync(root, { withFileTypes: true }).map((entry) => [
    entry.name,
    entry.isDirectory() ? snapshotTree(join(root, entry.name)) : readFileSync(join(root, entry.name)),
  ]));
}

test("trigger replaces stale files and sibling skills with the complete bundle", () => fixture(({root, source, target, invoke}) => {
  const sibling = join(target, "../old-name");
  mkdirSync(sibling); writeFileSync(join(sibling, "SKILL.md"), "Old fixture");
  const result = invoke(); assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(join(target, "SKILL.md"), "utf8"), readFileSync(join(source, "SKILL.md"), "utf8"));
  assert.equal(readFileSync(join(target, "references/contract.md"), "utf8"), "Keep the caller contract.\n");
  assert.equal(existsSync(join(target, "stale.md")), false);
  assert.equal(existsSync(sibling), false);
}));

test("keep_skills preserves named siblings and still refreshes the skill under test", () => fixture(({source, target, config, invoke}) => {
  const kept = join(target, "../helper");
  const dropped = join(target, "../old-name");
  mkdirSync(kept); writeFileSync(join(kept, "SKILL.md"), "Keep me");
  mkdirSync(dropped); writeFileSync(join(dropped, "SKILL.md"), "Drop me");
  writeFileSync(join(target, "SKILL.md"), "stale skill");
  writeFileSync(config, "metadata:\n  keep_skills: [helper]\nproviders:\n  - config:\n      working_dir: ./workspace\n");
  const result = invoke(); assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(join(kept, "SKILL.md"), "utf8"), "Keep me");
  assert.equal(existsSync(dropped), false);
  assert.equal(readFileSync(join(target, "SKILL.md"), "utf8"), readFileSync(join(source, "SKILL.md"), "utf8"));
  assert.equal(existsSync(join(target, "stale.md")), false);
  assert.equal(existsSync(join(target, "references/contract.md")), true);
}));

for (const name of ["../outside", "nested/skill", "", "."]) {
  test(`reject unsafe keep_skills name ${JSON.stringify(name)} before cleanup`, () => fixture(({config, target, invoke, root}) => {
    writeFileSync(config, `metadata:\n  keep_skills: [${JSON.stringify(name)}]\nproviders:\n  - config:\n      working_dir: ./workspace\n`);
    const result = invoke(); assert.equal(result.status, 1);
    assert.equal(existsSync(join(target, "stale.md")), true, "validation precedes mutation");
    assert.equal(existsSync(join(root, "calls")), false);
  }));
}

test("reject a symlinked kept skill before cleanup", () => fixture(({suite, config, target, root, invoke}) => {
  const outside = join(root, "outside"); mkdirSync(outside); writeFileSync(join(outside, "keep"), "untouched");
  symlinkSync(outside, join(suite, "workspace/.agents/skills/helper"));
  writeFileSync(config, "metadata:\n  keep_skills: [helper]\nproviders:\n  - config:\n      working_dir: ./workspace\n");
  const result = invoke(); assert.equal(result.status, 1);
  assert.equal(readFileSync(join(outside, "keep"), "utf8"), "untouched");
  assert.equal(existsSync(join(target, "stale.md")), true, "validation precedes mutation");
}));

test("keep_skills cannot name the skill under test", () => fixture(({config, target, invoke, root}) => {
  writeFileSync(config, "metadata:\n  keep_skills: [principle-fixture]\nproviders:\n  - config:\n      working_dir: ./workspace\n");
  const result = invoke(); assert.equal(result.status, 1);
  assert.equal(existsSync(join(target, "stale.md")), true, "validation precedes mutation");
  assert.equal(existsSync(join(root, "calls")), false);
}));

test("quoted working_dir and misleading comments follow YAML semantics", () => fixture(({config, target, invoke}) => {
  writeFileSync(config, '# working_dir: ../../outside\nproviders:\n  - config:\n      working_dir: "./workspace" # owned fixture\n');
  const result = invoke(); assert.equal(result.status, 0, result.stderr);
  assert.equal(existsSync(join(target, "references/contract.md")), true);
}));

for (const value of ["../outside", "/tmp/outside", "."]) {
  test(`reject unsafe fixture directory ${value}`, () => fixture(({config, target, invoke, root}) => {
    writeFileSync(config, `providers:\n  - config:\n      working_dir: ${value}\n`);
    const result = invoke(); assert.equal(result.status, 1);
    assert.equal(existsSync(join(target, "stale.md")), true, "validation precedes mutation");
    assert.equal(existsSync(join(root, "calls")), false);
  }));
}

test("reject fixture ancestor symlinks without touching their destination", () => fixture(({suite, config, root, invoke}) => {
  const outside = join(root, "outside"); mkdirSync(outside); writeFileSync(join(outside, "keep"), "untouched");
  symlinkSync(outside, join(suite, "linked"));
  writeFileSync(config, 'providers:\n  - config:\n      working_dir: ./linked\n');
  const result = invoke(); assert.equal(result.status, 1);
  assert.equal(readFileSync(join(outside, "keep"), "utf8"), "untouched");
}));

test("missing directory and duplicate or missing source fail before evaluation", () => fixture(({config, source, root, invoke}) => {
  writeFileSync(config, "providers: []\n"); assert.equal(invoke().status, 1);
  writeFileSync(config, "providers:\n  - config:\n      working_dir: ./workspace\n");
  const duplicate = join(root, "src/other/skills/principle-fixture"); mkdirSync(duplicate, {recursive:true});
  writeFileSync(join(duplicate, "SKILL.md"), "Duplicate"); assert.equal(invoke().status, 1);
  rmSync(duplicate, {recursive:true}); rmSync(source, {recursive:true}); assert.equal(invoke().status, 1);
  assert.equal(existsSync(join(root, "calls")), false);
}));

for (const mode of ["check", "test", "compare"]) {
  test(`${mode} does not refresh fixtures`, () => fixture(({target, invoke}) => {
    const result = invoke(mode); assert.equal(result.status, 0, result.stderr);
    assert.equal(existsSync(join(target, "stale.md")), true);
  }));
}
test("unmatched filter fails", () => fixture(({invoke}) => assert.equal(invoke("trigger", "unknown").status, 2)));

for (const [extraOption, expectedStatus] of [["", 0], ["      unrelated_unknown_option: true\n", 1]]) {
  test(`native provider validation keeps fixture metadata private (${expectedStatus === 0 ? "valid" : "invalid"} provider)`, () => fixture(({root, suite, config, target, invoke}) => {
    useNativePromptfoo(root);
    writeFileSync(join(suite, "promptfooconfig.yaml"), 'prompts: ["Validate only"]\nproviders: ["echo"]\ntests: [{vars: {}}]\n');
    mkdirSync(join(suite, "prompts"));
    writeFileSync(join(suite, "prompts/request.txt"), "Validate the relative prompt without model execution.");
    const companion = join(root, "src/core/skills/canonical-helper");
    mkdirSync(companion, { recursive: true });
    writeFileSync(join(companion, "SKILL.md"), "Canonical companion");
    const original = `metadata:\n  keep_skills: [helper]\n  fixture_skills: [canonical-helper]\nprompts: ["file://prompts/request.txt"]\nproviders:\n  - id: openai:codex-sdk\n    config: &subject\n      working_dir: ./workspace\n${extraOption}defaultTest:\n  assert:\n    - type: agent-rubric\n      value: "Use the fixture contract."\n      provider:\n        id: openai:codex-sdk\n        config: *subject\ntests: [{vars: {}}]\n`;
    writeFileSync(config, original);
    const result = invoke("check");
    assert.equal(result.status, expectedStatus, result.stdout + result.stderr);
    assert.equal(readFileSync(config, "utf8"), original, "validation preserves the authored config");
    assert.equal(existsSync(join(target, "stale.md")), true, "check remains read-only for fixtures");
  }));
}

for (const [name, metadata, diagnostic] of [
  ["non-array keep list", "keep_skills: helper", /metadata\.keep_skills/],
  ["unsafe kept name", "keep_skills: [../outside]", /metadata\.keep_skills/],
  ["kept target", "keep_skills: [principle-fixture]", /metadata\.keep_skills/],
  ["non-array companion list", "fixture_skills: helper", /fixture_skills/],
  ["unsafe companion name", "fixture_skills: [../outside]", /fixture_skills/],
  ["companion target", "fixture_skills: [principle-fixture]", /fixture_skills/],
  ["duplicate companion", "fixture_skills: [helper, helper]", /fixture_skills/],
  ["kept companion", "keep_skills: [helper]\n  fixture_skills: [helper]", /fixture_skills/],
]) {
  test(`check rejects ${name} without fixture mutation`, () => fixture(({root, suite, config, invoke}) => {
    const companion = join(root, "src/core/skills/helper");
    mkdirSync(companion, { recursive: true });
    writeFileSync(join(companion, "SKILL.md"), "Canonical companion");
    writeFileSync(config, `metadata:\n  ${metadata}\nproviders:\n  - config:\n      working_dir: ./workspace\n`);
    const before = snapshotTree(suite);
    const result = invoke("check");
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, diagnostic);
    assert.deepEqual(snapshotTree(suite), before, "rejected check leaves configs and fixtures byte-identical");
  }));
}

for (const count of [0, 2]) {
  test(`check rejects a ${count === 0 ? "missing" : "non-unique"} canonical companion without mutation`, () => fixture(({root, suite, config, invoke}) => {
    for (const plugin of ["core", "other"].slice(0, count)) {
      const companion = join(root, "src", plugin, "skills/helper");
      mkdirSync(companion, { recursive: true });
      writeFileSync(join(companion, "SKILL.md"), "Canonical companion");
    }
    writeFileSync(config, "metadata:\n  fixture_skills: [helper]\nproviders:\n  - config:\n      working_dir: ./workspace\n");
    const before = snapshotTree(suite);
    const result = invoke("check");
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, /helper/);
    assert.deepEqual(snapshotTree(suite), before);
  }));
}

test("valid check leaves populated target, companion, kept and unrelated fixtures byte-identical", () => fixture(({root, suite, config, target, invoke}) => {
  const companion = join(root, "src/core/skills/helper");
  mkdirSync(join(companion, "references"), { recursive: true });
  writeFileSync(join(companion, "SKILL.md"), "New canonical companion");
  writeFileSync(join(companion, "references/contract.md"), "New canonical resource");
  writeFileSync(join(target, "SKILL.md"), "Existing target, not canonical");
  for (const name of ["helper", "private-helper", "old-name"]) {
    const sibling = join(target, "..", name);
    mkdirSync(join(sibling, "references"), { recursive: true });
    writeFileSync(join(sibling, "SKILL.md"), `Existing ${name}`);
    writeFileSync(join(sibling, "references/contract.bin"), Buffer.from([0, 255, 1, 10]));
  }
  writeFileSync(config, "metadata:\n  keep_skills: [private-helper]\n  fixture_skills: [helper]\nproviders:\n  - config:\n      working_dir: ./workspace\n");
  const before = snapshotTree(suite);
  const result = invoke("check");
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.deepEqual(snapshotTree(suite), before, "check neither refreshes, prunes nor rewrites authored YAML");
}));

test("declared companion bundles populate from canonical sources and refresh on replay", () => fixture(({root, config, target, invoke}) => {
  const source = join(root, "src/core/skills/helper");
  mkdirSync(join(source, "references"), { recursive: true });
  writeFileSync(join(source, "SKILL.md"), "Read references/contract.md");
  writeFileSync(join(source, "references/contract.md"), "Current owner contract");
  writeFileSync(config, "metadata:\n  fixture_skills: [helper]\nproviders:\n  - config:\n      working_dir: ./workspace\n");
  const destination = join(target, "../helper");
  let result = invoke(); assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(join(destination, "references/contract.md"), "utf8"), "Current owner contract");
  writeFileSync(join(source, "references/contract.md"), "Changed owner contract");
  writeFileSync(join(destination, "stale.md"), "Removed reference");
  result = invoke(); assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(join(destination, "references/contract.md"), "utf8"), "Changed owner contract");
  assert.equal(existsSync(join(destination, "stale.md")), false);
}));

for (const name of ["../outside", "missing", "principle-fixture"]) {
  test(`reject invalid companion ${name} before fixture cleanup`, () => fixture(({root, config, target, invoke}) => {
    writeFileSync(config, `metadata:\n  fixture_skills: [${JSON.stringify(name)}]\nproviders:\n  - config:\n      working_dir: ./workspace\n`);
    const result = invoke(); assert.equal(result.status, 1);
    assert.equal(existsSync(join(target, "stale.md")), true);
    assert.equal(existsSync(join(root, "calls")), false);
  }));
}

test("companion refresh cannot overwrite an explicitly kept fixture", () => fixture(({root, config, target, invoke}) => {
  const source = join(root, "src/core/skills/helper");
  const kept = join(target, "../helper");
  mkdirSync(source, { recursive: true }); mkdirSync(kept);
  writeFileSync(join(source, "SKILL.md"), "Source");
  writeFileSync(join(kept, "SKILL.md"), "Fixture-specific user contract");
  writeFileSync(config, "metadata:\n  fixture_skills: [helper]\n  keep_skills: [helper]\nproviders:\n  - config:\n      working_dir: ./workspace\n");
  const result = invoke(); assert.equal(result.status, 1);
  assert.equal(readFileSync(join(kept, "SKILL.md"), "utf8"), "Fixture-specific user contract");
  assert.equal(existsSync(join(target, "stale.md")), true);
}));

for (const keep of ["helper", "{helper: true}"]) {
  test(`reject non-array metadata.keep_skills ${keep} before cleanup`, () => fixture(({config, target, root, invoke}) => {
    writeFileSync(config, `metadata:\n  keep_skills: ${keep}\nproviders:\n  - config:\n      working_dir: ./workspace\n`);
    const result = invoke();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /metadata\.keep_skills must be an array/);
    assert.equal(existsSync(join(target, "stale.md")), true);
    assert.equal(existsSync(join(root, "calls")), false);
  }));
}

for (const mode of ["trigger", "check"]) {
  test(`${mode} diagnoses misplaced provider keep_skills without deleting fixtures`, () => fixture(({config, target, root, invoke}) => {
    const kept = join(target, "../helper");
    mkdirSync(kept);
    writeFileSync(join(kept, "SKILL.md"), "Private fixture");
    writeFileSync(config, "providers:\n  - config:\n      working_dir: ./workspace\n      keep_skills: [helper]\n");
    const result = invoke(mode);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /provider\.config\.keep_skills.*metadata\.keep_skills/);
    assert.equal(readFileSync(join(kept, "SKILL.md"), "utf8"), "Private fixture");
    assert.equal(existsSync(join(target, "stale.md")), true);
    const calls = existsSync(join(root, "calls")) ? readFileSync(join(root, "calls"), "utf8") : "";
    assert.doesNotMatch(calls, /trigger\.promptfooconfig/);
  }));
}

test("a malformed config does not prevent checking the other config in its suite", () => fixture(({root, suite, invoke}) => {
  writeFileSync(join(suite, "promptfooconfig.yaml"), "providers: [\n");
  const result = invoke("check");
  assert.equal(result.status, 1);
  assert.match(readFileSync(join(root, "calls"), "utf8"), /trigger\.promptfooconfig\.yaml/);
}));

for (const failure of ["parse", "command"]) {
  test(`a ${failure} failure does not prevent evaluating later selected skills`, () => fixture(({root, config, invoke}) => {
    const later = join(root, "evals/z-later");
    mkdirSync(later);
    writeFileSync(join(later, "promptfooconfig.yaml"), "providers: []\n");
    if (failure === "parse") {
      writeFileSync(config, "providers: [\n");
    } else {
      writeFileSync(join(root, "bin/promptfoo"), '#!/bin/sh\nprintf "%s\\n" "$@" >> "$CALL_LOG"\ncase "$*" in *principle-fixture*) exit 7;; esac\n', { mode: 0o755 });
    }
    const result = invoke("check", "");
    assert.equal(result.status, failure === "parse" ? 1 : 7, result.stdout + result.stderr);
    assert.match(readFileSync(join(root, "calls"), "utf8"), /evals\/z-later\/promptfooconfig\.yaml/);
  }));
}

test("a missing native executable is reported per config rather than aborting the selection", () => fixture(({root, invoke}) => {
  const later = join(root, "evals/z-later");
  mkdirSync(later);
  writeFileSync(join(later, "promptfooconfig.yaml"), "providers: []\n");
  writeFileSync(join(root, "bin/promptfoo"), "#!/missing-skill-eval-interpreter\n", { mode: 0o755 });
  const result = invoke("check", "");
  assert.equal(result.status, 1);
  assert.match(result.stdout, /==> z-later/);
  assert.equal((result.stderr.match(/ENOENT/g) ?? []).length, 3, result.stderr);
}));

test("native validation rejects a genuinely missing relative prompt", () => fixture(({root, suite, config, target, invoke}) => {
  useNativePromptfoo(root);
  writeFileSync(join(suite, "promptfooconfig.yaml"), 'prompts: ["Validate only"]\nproviders: ["echo"]\ntests: [{vars: {}}]\n');
  writeFileSync(config, 'metadata:\n  keep_skills: [helper]\nprompts: ["file://prompts/missing.txt"]\nproviders:\n  - id: openai:codex-sdk\n    config:\n      working_dir: ./workspace\ntests: [{vars: {}}]\n');
  const result = invoke("check");
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /missing\.txt/);
  assert.equal(existsSync(join(target, "stale.md")), true);
}));

test("native trigger executes the refreshed bundle and reports failed assertions without gating", () => fixture(({root, suite, config, target, invoke}) => {
  useNativePromptfoo(root);
  const kept = join(target, "../helper");
  mkdirSync(kept);
  writeFileSync(join(kept, "SKILL.md"), "Private fixture");
  mkdirSync(join(suite, "prompts"));
  writeFileSync(join(suite, "prompts/request.txt"), "Check {{journey}}");
  writeFileSync(join(suite, "provider.cjs"), `const { readFileSync } = require("node:fs");
const { join } = require("node:path");
module.exports = class FixtureConsumer {
  constructor(options) { this.config = options.config; }
  id() { return "fixture-consumer"; }
  async callApi(prompt) {
    const skills = join(__dirname, this.config.working_dir, ".agents/skills");
    const contract = readFileSync(join(skills, "principle-fixture/references/contract.md"), "utf8").trim();
    const helper = readFileSync(join(skills, "helper/SKILL.md"), "utf8");
    return { output: [prompt, contract, helper].join(" | ") };
  }
};
`);
  const report = join(root, "trigger-results.json");
  const original = `metadata:
  keep_skills: [helper]
prompts:
  - id: file://prompts/request.txt
    label: with-skill
providers:
  - id: file://provider.cjs
    config: &fixture
      working_dir: ./workspace
defaultTest:
  metadata: *fixture
outputPath: ${JSON.stringify(report)}
tests:
  - description: refreshed contract passes
    vars: {journey: checkout}
    assert:
      - type: equals
        value: Check checkout | Keep the caller contract. | Private fixture
  - description: incorrect expectation fails
    vars: {journey: history}
    assert:
      - type: equals
        value: This must not pass
`;
  writeFileSync(config, original);
  const result = invoke();
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const {results} = JSON.parse(readFileSync(report, "utf8"));
  assert.equal(results.stats.successes, 1);
  assert.equal(results.stats.failures, 1);
  assert.equal(results.stats.errors, 0);
  const rows = results.results.toSorted((a, b) => a.testIdx - b.testIdx);
  assert.equal(rows[0].response.output, "Check checkout | Keep the caller contract. | Private fixture");
  assert.equal(rows[0].success, true);
  assert.equal(rows[1].response.output, "Check history | Keep the caller contract. | Private fixture");
  assert.equal(rows[1].success, false);
  assert.equal(rows[1].gradingResult.pass, false);
  assert.equal(readFileSync(config, "utf8"), original);
  assert.equal(existsSync(join(target, "stale.md")), false);
  assert.equal(readFileSync(join(kept, "SKILL.md"), "utf8"), "Private fixture");

  // The same real engine result gates test mode rather than being hidden by the
  // informational exit policy used only for comparisons and trigger selection.
  const gatedReportPath = join(root, "gated-results.json");
  writeFileSync(join(suite, "promptfooconfig.yaml"), original.replace(JSON.stringify(report), JSON.stringify(gatedReportPath)));
  const gated = invoke("test");
  assert.equal(gated.status, 100, gated.stdout + gated.stderr);
  const gatedReport = JSON.parse(readFileSync(gatedReportPath, "utf8"));
  assert.equal(gatedReport.results.stats.successes, 1);
  assert.equal(gatedReport.results.stats.failures, 1);
  assert.equal(gatedReport.results.stats.errors, 0);
}));
