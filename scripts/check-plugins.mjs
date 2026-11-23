import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repository = 'https://github.com/mintuz/skills';
const antigravitySchema = 'https://antigravity.google/schemas/v1/plugin.json';
const antigravityAllowedKeys = new Set([
  '$schema',
  'name',
  'displayName',
  'display_name',
  'description',
  'version',
  'disabled',
  'logo',
  'suggestedPrompts',
  'suggested_prompts',
  'skills',
  'author',
  'homepage',
  'repository',
  'license',
  'keywords',
  'extensions',
]);
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const directories = (path) => readdirSync(path, { withFileTypes: true })
  .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
const names = (entries) => entries.map((entry) => entry.name).sort();
const inside = (base, path, { requireDotSlash = true } = {}) => {
  assert.equal(typeof path, 'string', 'Component and source paths must be strings');
  if (requireDotSlash) {
    assert.ok(path.startsWith('./'), `Expected a relative path: ${path}`);
  }
  const target = resolve(base, path);
  const remainder = relative(base, target);
  assert.ok(remainder !== '..' && !remainder.startsWith('../') && !isAbsolute(remainder),
    `Path escapes its root: ${path}`);
  assert.ok(existsSync(target), `Missing path: ${target}`);
  return target;
};

const shared = readJson(resolve(root, '.claude-plugin/marketplace.json'));
const codex = readJson(resolve(root, '.agents/plugins/marketplace.json'));
const omp = readJson(resolve(root, '.omp-plugin/marketplace.json'));
const antigravityDiscovery = readJson(resolve(root, '.agents/plugins.json'));
assert.deepEqual(omp, shared, 'OMP and Claude Code catalogues differ');
const pluginNames = directories(resolve(root, 'src'));
assert.equal(shared.name, codex.name, 'Marketplace names differ');
assert.ok(shared.owner?.name, 'Claude Code and OMP require owner.name');
assert.deepEqual(names(shared.plugins), pluginNames, 'Shared catalogue does not match src/');
assert.deepEqual(names(codex.plugins), pluginNames, 'Codex catalogue does not match src/');
assert.ok(Array.isArray(antigravityDiscovery.entries) && antigravityDiscovery.entries.length > 0,
  'Antigravity .agents/plugins.json must declare at least one entry');
const antigravityRoots = antigravityDiscovery.entries.map((entry) =>
  inside(root, entry.path, { requireDotSlash: false }));
assert.ok(antigravityRoots.includes(resolve(root, 'src')),
  'Antigravity .agents/plugins.json must include src');

let skillCount = 0;
for (const entry of shared.plugins) {
  const pluginRoot = inside(root, entry.source);
  assert.equal(pluginRoot, resolve(root, 'src', entry.name), `Wrong source for ${entry.name}`);
  const claude = readJson(resolve(pluginRoot, '.claude-plugin/plugin.json'));
  const ompManifest = readJson(resolve(pluginRoot, '.omp-plugin/plugin.json'));
  assert.deepEqual(ompManifest, claude, `OMP and Claude Code manifests differ for ${entry.name}`);
  const manifest = readJson(resolve(pluginRoot, '.codex-plugin/plugin.json'));
  const antigravity = readJson(resolve(pluginRoot, '.antigravity-plugin/plugin.json'));
  const codexEntry = codex.plugins.find((plugin) => plugin.name === entry.name);
  assert.equal(codexEntry.source.source, 'local', `Expected a local source for ${entry.name}`);
  assert.equal(inside(root, codexEntry.source.path), pluginRoot, `Sources differ for ${entry.name}`);
  for (const key of Object.keys(antigravity)) {
    assert.ok(antigravityAllowedKeys.has(key),
      `Unsupported Antigravity manifest key "${key}" for ${entry.name}`);
  }
  assert.equal(antigravity.$schema, antigravitySchema,
    `Unexpected Antigravity $schema for ${entry.name}`);
  assert.match(antigravity.name, /^[a-z0-9]+(-[a-z0-9]+)*$/,
    `Antigravity name must be kebab-case for ${entry.name}`);
  assert.ok(typeof antigravity.displayName === 'string' && antigravity.displayName.trim().length > 0,
    `Missing Antigravity displayName for ${entry.name}`);
  assert.ok(typeof antigravity.description === 'string' && antigravity.description.trim().length > 0,
    `Missing Antigravity description for ${entry.name}`);
  if (antigravity.suggestedPrompts !== undefined) {
    assert.ok(Array.isArray(antigravity.suggestedPrompts) &&
      antigravity.suggestedPrompts.length > 0 &&
      antigravity.suggestedPrompts.length <= 3,
      `Antigravity suggestedPrompts must have 1 to 3 entries for ${entry.name}`);
  }
  for (const metadata of [claude, manifest, antigravity]) {
    assert.equal(metadata.name, entry.name, `Manifest name differs for ${entry.name}`);
    assert.match(metadata.version, /^\d+\.\d+\.\d+$/, `Invalid version for ${entry.name}`);
    assert.equal(metadata.repository, repository, `Stale repository for ${entry.name}`);
  }
  assert.equal(claude.version, manifest.version, `Host versions differ for ${entry.name}`);
  assert.equal(claude.version, antigravity.version, `Antigravity version differs for ${entry.name}`);
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
  const antigravityMcpPath = resolve(pluginRoot, 'mcp_config.json');
  if (existsSync(mcpPath)) {
    assert.equal(inside(pluginRoot, manifest.mcpServers), mcpPath,
      `MCP configuration differs for ${entry.name}`);
    const mcpServers = readJson(mcpPath).mcpServers;
    assert.ok(mcpServers, `Invalid MCP configuration for ${entry.name}`);
    assert.ok(existsSync(antigravityMcpPath), `Missing Antigravity mcp_config.json for ${entry.name}`);
    const antigravityMcpServers = readJson(antigravityMcpPath).mcpServers;
    assert.ok(antigravityMcpServers, `Invalid Antigravity mcp_config.json for ${entry.name}`);
    assert.deepEqual(Object.keys(antigravityMcpServers).sort(), Object.keys(mcpServers).sort(),
      `Antigravity MCP server names differ for ${entry.name}`);
    for (const [serverName, serverConfig] of Object.entries(mcpServers)) {
      const agyServer = antigravityMcpServers[serverName];
      assert.equal(agyServer.command, serverConfig.command,
        `Antigravity MCP command differs for ${entry.name}:${serverName}`);
      assert.deepEqual(agyServer.args, serverConfig.args,
        `Antigravity MCP args differ for ${entry.name}:${serverName}`);
      assert.equal(agyServer.timeout, undefined,
        `Use timeoutSeconds instead of timeout in Antigravity mcp_config.json for ${entry.name}:${serverName}`);
    }
  } else {
    assert.equal(manifest.mcpServers, undefined, `Unexpected MCP configuration for ${entry.name}`);
    assert.ok(!existsSync(antigravityMcpPath),
      `Unexpected Antigravity mcp_config.json for ${entry.name}`);
  }
  skillCount += skillNames.length;
}
console.log(`Validated ${pluginNames.length} plugins and ${skillCount} skills for Codex, Claude Code, OMP and Antigravity.`);
