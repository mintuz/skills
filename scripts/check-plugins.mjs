import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repository = 'https://github.com/mintuz/skills';
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const directories = (path) => readdirSync(path, { withFileTypes: true })
  .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
const names = (entries) => entries.map((entry) => entry.name).sort();
const inside = (base, path) => {
  assert.equal(typeof path, 'string', 'Component and source paths must be strings');
  assert.ok(path.startsWith('./'), `Expected a relative path: ${path}`);
  const target = resolve(base, path);
  const remainder = relative(base, target);
  assert.ok(remainder !== '..' && !remainder.startsWith('../') && !isAbsolute(remainder),
    `Path escapes its root: ${path}`);
  assert.ok(existsSync(target), `Missing path: ${target}`);
  return target;
};

const shared = readJson(resolve(root, '.claude-plugin/marketplace.json'));
const codex = readJson(resolve(root, '.agents/plugins/marketplace.json'));
const pluginNames = directories(resolve(root, 'src'));
assert.equal(shared.name, codex.name, 'Marketplace names differ');
assert.ok(shared.owner?.name, 'Claude Code and OMP require owner.name');
assert.deepEqual(names(shared.plugins), pluginNames, 'Shared catalogue does not match src/');
assert.deepEqual(names(codex.plugins), pluginNames, 'Codex catalogue does not match src/');

let skillCount = 0;
for (const entry of shared.plugins) {
  const pluginRoot = inside(root, entry.source);
  assert.equal(pluginRoot, resolve(root, 'src', entry.name), `Wrong source for ${entry.name}`);
  const claude = readJson(resolve(pluginRoot, '.claude-plugin/plugin.json'));
  const manifest = readJson(resolve(pluginRoot, '.codex-plugin/plugin.json'));
  const codexEntry = codex.plugins.find((plugin) => plugin.name === entry.name);
  assert.equal(codexEntry.source.source, 'local', `Expected a local source for ${entry.name}`);
  assert.equal(inside(root, codexEntry.source.path), pluginRoot, `Sources differ for ${entry.name}`);
  for (const metadata of [claude, manifest]) {
    assert.equal(metadata.name, entry.name, `Manifest name differs for ${entry.name}`);
    assert.match(metadata.version, /^\d+\.\d+\.\d+$/, `Invalid version for ${entry.name}`);
    assert.equal(metadata.repository, repository, `Stale repository for ${entry.name}`);
  }
  assert.equal(claude.version, manifest.version, `Host versions differ for ${entry.name}`);
  assert.equal(entry.version, claude.version, `Catalogue version differs for ${entry.name}`);
  const skillsRoot = inside(pluginRoot, manifest.skills);
  const skillNames = directories(skillsRoot);
  const registeredSkills = entry.skills.map((path) => {
    const skillRoot = inside(pluginRoot, path);
    assert.ok(existsSync(resolve(skillRoot, 'SKILL.md')), `Missing SKILL.md: ${path}`);
    return relative(skillsRoot, skillRoot);
  }).sort();
  assert.deepEqual(registeredSkills, skillNames, `Skill inventory differs for ${entry.name}`);
  for (const skill of skillNames) {
    assert.ok(existsSync(resolve(skillsRoot, skill, 'SKILL.md')), `Missing SKILL.md: ${skill}`);
  }
  const mcpPath = resolve(pluginRoot, '.mcp.json');
  if (existsSync(mcpPath)) {
    assert.equal(inside(pluginRoot, manifest.mcpServers), mcpPath,
      `MCP configuration differs for ${entry.name}`);
    assert.ok(readJson(mcpPath).mcpServers, `Invalid MCP configuration for ${entry.name}`);
  } else {
    assert.equal(manifest.mcpServers, undefined, `Unexpected MCP configuration for ${entry.name}`);
  }
  skillCount += skillNames.length;
}
console.log(`Validated ${pluginNames.length} plugins and ${skillCount} skills for Codex, Claude Code and OMP.`);
