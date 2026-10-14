import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, delimiter } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const runner = fileURLToPath(new URL("run-skill-evals.mjs", import.meta.url));
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
    const invoke = (mode = "trigger", name = "principle-fixture") => spawnSync(process.execPath, [runner, mode, name], {
      cwd: root, env: { ...process.env, PATH: bin + delimiter + process.env.PATH, CALL_LOG: join(root, "calls") }, encoding: "utf8",
    });
    run({root, source, suite, target, config, invoke});
  } finally { rmSync(root, { recursive: true, force: true }); }
}

test("trigger replaces stale files and sibling skills with the complete bundle", () => fixture(({root, source, target, invoke}) => {
  const sibling = join(target, "../old-name");
  mkdirSync(sibling); writeFileSync(join(sibling, "SKILL.md"), "Old fixture");
  const result = invoke(); assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(join(target, "SKILL.md"), "utf8"), readFileSync(join(source, "SKILL.md"), "utf8"));
  assert.equal(readFileSync(join(target, "references/contract.md"), "utf8"), "Keep the caller contract.\n");
  assert.equal(existsSync(join(target, "stale.md")), false);
  assert.equal(existsSync(sibling), false);
  assert.match(readFileSync(join(root, "calls"), "utf8"), /-c\nevals\/principle-fixture\/trigger.promptfooconfig.yaml/);
}));

test("keep_skills preserves named siblings and still refreshes the skill under test", () => fixture(({source, target, config, invoke}) => {
  const kept = join(target, "../helper");
  const dropped = join(target, "../old-name");
  mkdirSync(kept); writeFileSync(join(kept, "SKILL.md"), "Keep me");
  mkdirSync(dropped); writeFileSync(join(dropped, "SKILL.md"), "Drop me");
  writeFileSync(join(target, "SKILL.md"), "stale skill");
  writeFileSync(config, "providers:\n  - config:\n      working_dir: ./workspace\n      keep_skills:\n        - helper\n");
  const result = invoke(); assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(join(kept, "SKILL.md"), "utf8"), "Keep me");
  assert.equal(existsSync(dropped), false);
  assert.equal(readFileSync(join(target, "SKILL.md"), "utf8"), readFileSync(join(source, "SKILL.md"), "utf8"));
  assert.equal(existsSync(join(target, "stale.md")), false);
  assert.equal(existsSync(join(target, "references/contract.md")), true);
}));

for (const name of ["../outside", "nested/skill", "", "."]) {
  test(`reject unsafe keep_skills name ${JSON.stringify(name)} before cleanup`, () => fixture(({config, target, invoke, root}) => {
    writeFileSync(config, `providers:\n  - config:\n      working_dir: ./workspace\n      keep_skills:\n        - ${JSON.stringify(name)}\n`);
    const result = invoke(); assert.equal(result.status, 1);
    assert.equal(existsSync(join(target, "stale.md")), true, "validation precedes mutation");
    assert.equal(existsSync(join(root, "calls")), false);
  }));
}

test("reject a symlinked kept skill before cleanup", () => fixture(({suite, config, target, root, invoke}) => {
  const outside = join(root, "outside"); mkdirSync(outside); writeFileSync(join(outside, "keep"), "untouched");
  symlinkSync(outside, join(suite, "workspace/.agents/skills/helper"));
  writeFileSync(config, "providers:\n  - config:\n      working_dir: ./workspace\n      keep_skills:\n        - helper\n");
  const result = invoke(); assert.equal(result.status, 1);
  assert.equal(readFileSync(join(outside, "keep"), "utf8"), "untouched");
  assert.equal(existsSync(join(target, "stale.md")), true, "validation precedes mutation");
}));

test("keep_skills cannot name the skill under test", () => fixture(({config, target, invoke, root}) => {
  writeFileSync(config, "providers:\n  - config:\n      working_dir: ./workspace\n      keep_skills:\n        - principle-fixture\n");
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
