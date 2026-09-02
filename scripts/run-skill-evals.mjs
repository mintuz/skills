import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

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

// The trigger fixture is a disposable copy of the skill, git-ignored so it can
// never drift from the source. Refresh it from src/ before every trigger run.
function refreshFixture(skill) {
  const config = readFileSync(triggerPath(skill), "utf8");
  const workingDir = config.match(/working_dir:\s*(\S+)/)?.[1];
  if (!workingDir) {
    throw new Error(`${triggerPath(skill)} declares no working_dir.`);
  }

  const source = readdirSync("src", { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join("src", entry.name, "skills", skill, "SKILL.md"))
    .find(existsSync);
  if (!source) {
    throw new Error(`No SKILL.md under src/*/skills/${skill}/ to build a fixture from.`);
  }

  const target = join(
    "evals",
    skill,
    workingDir.replace(/^\.\//, ""),
    ".agents",
    "skills",
    skill,
  );
  mkdirSync(target, { recursive: true });
  copyFileSync(source, join(target, "SKILL.md"));
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
