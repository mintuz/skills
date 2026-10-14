import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, lstatSync } from "node:fs";
import { dirname, join, resolve, relative, isAbsolute, sep } from "node:path";

import { parse } from "yaml";

const MAIN_CONFIG = "promptfooconfig.yaml";
const TRIGGER_CONFIG = "trigger.promptfooconfig.yaml";

const [mode, filter, ...extra] = process.argv.slice(2).filter((arg) => arg !== "--");
const args = {
  check: ["validate"],
  compare: ["eval", "--no-cache", "-j", "2"],
  test: ["eval", "--filter-prompts", "with-skill", "--no-cache", "-j", "2"],
  trigger: ["eval", "--no-cache", "-j", "2"],
}[mode];

if (!args || extra.length) {
  console.error("Usage: run-skill-evals.mjs <check|compare|test|trigger> [skill]");
  process.exit(2);
}

const triggerPath = (skill) => join("evals", skill, TRIGGER_CONFIG);

const skills = readdirSync("evals", { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && (!filter || entry.name === filter))
  .map((entry) => entry.name)
  .filter((skill) => mode !== "trigger" || existsSync(triggerPath(skill)))
  .sort();

if (!skills.length) {
  const what = mode === "trigger" ? "trigger eval" : "eval";
  console.error(`No ${what} found${filter ? ` for ${filter}` : ""}.`);
  process.exit(2);
}

const SIBLING_SKILL_NAME = /^(?!\.\.?$)[A-Za-z0-9._-]+$/;

// Opt-in sibling names. Absent or empty means the fixture holds exactly one skill.
function keepSkills(providers, skill) {
  const lists = providers.map((provider) => {
    const value = provider?.config?.keep_skills;
    if (value == null) return [];
    if (!Array.isArray(value)) {
      throw new Error(`${triggerPath(skill)} keep_skills must be an array of sibling skill names.`);
    }
    return value;
  });
  if (new Set(lists.map((list) => JSON.stringify(list))).size !== 1) {
    throw new Error(`${triggerPath(skill)} must use one shared keep_skills list.`);
  }
  for (const name of lists[0]) {
    if (typeof name !== "string" || !SIBLING_SKILL_NAME.test(name)) {
      throw new Error(`${triggerPath(skill)} keep_skills entries must be single skill directory names.`);
    }
    if (name === skill) {
      throw new Error(`${triggerPath(skill)} keep_skills cannot include the skill under test; that copy is always refreshed.`);
    }
  }
  return lists[0];
}

// Rebuild the owned disposable fixture, including resources. By default the
// fixture holds exactly one skill: everything under `.agents/skills` is
// replaced by the skill under test. Set `keep_skills` on the trigger provider
// to preserve named sibling directories. Stale files inside the refreshed
// skill are still replaced. Path checks run before any deletion.
function refreshFixture(skill) {
  const config = parse(readFileSync(triggerPath(skill), "utf8"));
  const providers = Array.isArray(config?.providers) ? config.providers : [config?.providers];
  const directories = providers.map((provider) => provider?.config?.working_dir);
  if (!directories.length || directories.some((value) => typeof value !== "string" || !value)) {
    throw new Error(`${triggerPath(skill)} must declare provider working_dir values.`);
  }
  if (new Set(directories).size !== 1) {
    throw new Error(`${triggerPath(skill)} must use one shared trigger working_dir.`);
  }
  const kept = keepSkills(providers, skill);
  const workingDir = directories[0];
  const suite = resolve("evals", skill);
  const workspace = resolve(suite, workingDir);
  const withinSuite = relative(suite, workspace);
  if (isAbsolute(workingDir) || !withinSuite || withinSuite === ".." || withinSuite.startsWith(`..${sep}`) || isAbsolute(withinSuite)) {
    throw new Error(`Trigger working_dir must be a relative subdirectory of ${suite}.`);
  }

  const sources = readdirSync("src", { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join("src", entry.name, "skills", skill, "SKILL.md"))
    .filter(existsSync);
  if (sources.length !== 1) {
    throw new Error(`Expected one SKILL.md under src/*/skills/${skill}/; found ${sources.length}.`);
  }
  const source = sources[0];
  const fixtureRoot = join(workspace, ".agents", "skills");
  // Reject symlink ancestors before recursive cleanup, including dangling links.
  for (let path = fixtureRoot; path !== dirname(suite); path = dirname(path)) {
    try {
      if (lstatSync(path).isSymbolicLink()) throw new Error(`Fixture path is a symlink: ${path}`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  for (const name of kept) {
    const keptPath = join(fixtureRoot, name);
    try {
      if (lstatSync(keptPath).isSymbolicLink()) throw new Error(`Refusing to keep a symlinked skill: ${keptPath}`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  if (kept.length === 0) {
    rmSync(fixtureRoot, { recursive: true, force: true });
    mkdirSync(fixtureRoot, { recursive: true });
  } else {
    mkdirSync(fixtureRoot, { recursive: true });
    const preserve = new Set(kept);
    for (const entry of readdirSync(fixtureRoot)) {
      if (!preserve.has(entry)) rmSync(join(fixtureRoot, entry), { recursive: true, force: true });
    }
  }
  cpSync(dirname(source), join(fixtureRoot, skill), { recursive: true });
  return source;
}

function configsFor(skill) {
  if (mode === "trigger") return [triggerPath(skill)];
  const configs = [join("evals", skill, MAIN_CONFIG)];
  if (mode === "check" && existsSync(triggerPath(skill))) configs.push(triggerPath(skill));
  return configs;
}

const env = {
  ...process.env,
  PROMPTFOO_CONFIG_DIR: process.env.PROMPTFOO_CONFIG_DIR ?? ".promptfoo",
  PROMPTFOO_DISABLE_TELEMETRY: "1",
  // Comparisons and trigger runs report rather than gate. Trigger activation is
  // nondeterministic, and promptfoo's skill-used heuristic counts any read of
  // SKILL.md as use, so a negative case can fail on a correct refusal.
  ...(mode === "compare" || mode === "trigger" ? { PROMPTFOO_FAILED_TEST_EXIT_CODE: "0" } : {}),
};
const promptfoo = process.platform === "win32" ? "promptfoo.cmd" : "promptfoo";
let exitCode = 0;

for (const skill of skills) {
  console.log(`\n==> ${skill}`);

  if (mode === "trigger") {
    try {
      console.log(`    fixture refreshed from ${refreshFixture(skill)}`);
    } catch (error) {
      console.error(`    ${error.message}`);
      exitCode = 1;
      continue;
    }
  }

  for (const config of configsFor(skill)) {
    const result = spawnSync(promptfoo, [...args, "-c", config], { env, stdio: "inherit" });

    if (result.error) {
      console.error(result.error.message);
      process.exit(1);
    }
    if (result.status !== 0) exitCode = result.status ?? 1;
  }
}

process.exit(exitCode);
