import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {root, checkSkills} from './sync-skills.mjs';

test('plugin skill remains byte-identical to canonical source', checkSkills);

test('marketplaces resolve to the same plugin inside the repository', async () => {
  const claude = JSON.parse(await readFile(path.join(root, '.claude-plugin/marketplace.json')));
  const codex = JSON.parse(await readFile(path.join(root, '.agents/plugins/marketplace.json')));
  assert.equal(claude.name, codex.name);
  assert.equal(claude.plugins[0].source, codex.plugins[0].source.path);
  assert.equal(claude.plugins[0].name, 'galanty-launch');
  for (const file of ['plugin.json', '.claude-plugin/plugin.json']) {
    const manifest = JSON.parse(await readFile(path.join(root, claude.plugins[0].source, file)));
    assert.equal(manifest.name, claude.plugins[0].name);
    assert.equal(manifest.version, '0.1.0');
    assert.equal(manifest.license, 'MIT AND CC-BY-4.0');
  }
  for (const file of ['LICENSE-MIT', 'LICENSE-CC-BY-4.0', 'NOTICE.md']) assert.ok((await readFile(path.join(root, claude.plugins[0].source, file))).length > 0);
});

test('bundled Markdown links stay inside the plugin and resolve', async () => {
  const plugin = path.join(root, 'plugins/galanty-launch');
  async function visit(directory) {
    for (const entry of await readdir(directory, {withFileTypes: true})) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(full);
      else if (entry.name.endsWith('.md')) {
        const text = await readFile(full, 'utf8');
        for (const [, href] of text.matchAll(/\]\(([^)]+)\)/g)) {
          if (/^[a-z]+:|^#|^</i.test(href)) continue;
          const resolved = path.resolve(path.dirname(full), href.split('#')[0]);
          assert.ok(resolved.startsWith(`${plugin}${path.sep}`), `${full}: link escapes plugin: ${href}`);
          await readFile(resolved);
        }
      }
    }
  }
  await visit(path.join(plugin, 'skills'));
});

test('both plugin formats launch the same standalone CLI MCP server', async () => {
  const plugin = path.join(root, 'plugins/galanty-launch');
  const portable = JSON.parse(await readFile(path.join(plugin, 'plugin.json')));
  assert.equal(portable.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
  assert.equal(portable.extensions['com.openai'].requires_local_executor, true);
  // Portable plugins discover mcp.json at their root; marketplace entries only select that root.
  const config = JSON.parse(await readFile(path.join(plugin, 'mcp.json')));
  assert.equal(config.$schema, 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json');
  const claude = JSON.parse(await readFile(path.join(plugin, '.claude-plugin/plugin.json')));
  const expected = {command: 'npx', args: ['-y', '@galanty/cli', 'mcp']};
  assert.deepEqual(claude.mcpServers, {galanty: expected});
  assert.deepEqual(config.mcpServers, {galanty: {type: 'stdio', ...expected}});
});
