import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const [mode, filter, ...extra] = process.argv.slice(2).filter((arg) => arg !== "--");
const args = {
  check: ["validate"],
  compare: ["eval", "--no-cache", "-j", "2"],
  test: ["eval", "--filter-prompts", "with-skill", "--no-cache", "-j", "2"],
}[mode];

if (!args || extra.length) {
  console.error("Usage: run-skill-evals.mjs <check|compare|test> [skill]");
  process.exit(2);
}

const skills = readdirSync("evals", { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && (!filter || entry.name === filter))
  .map((entry) => entry.name)
  .sort();

if (!skills.length) {
  console.error(`No eval found${filter ? ` for ${filter}` : ""}.`);
  process.exit(2);
}

const env = {
  ...process.env,
  PROMPTFOO_CONFIG_DIR: ".promptfoo",
  PROMPTFOO_DISABLE_TELEMETRY: "1",
  ...(mode === "compare" ? { PROMPTFOO_FAILED_TEST_EXIT_CODE: "0" } : {}),
};
const promptfoo = process.platform === "win32" ? "promptfoo.cmd" : "promptfoo";
let exitCode = 0;

for (const skill of skills) {
  console.log(`\n==> ${skill}`);
  const result = spawnSync(
    promptfoo,
    [...args, "-c", join("evals", skill, "promptfooconfig.yaml")],
    { env, stdio: "inherit" },
  );

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) exitCode = result.status ?? 1;
}

process.exit(exitCode);
