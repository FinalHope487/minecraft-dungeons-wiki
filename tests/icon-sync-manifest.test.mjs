import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Wiki icon sync source IDs are unique', async () => {
  const syncSource = await readFile(new URL('../tools/sync-wiki-icons.mjs', import.meta.url), 'utf8');
  const manifest = syncSource.match(/const sourceEntries = \[([\s\S]*?)\n\];/);

  assert.ok(manifest, 'icon source manifest must remain discoverable');
  const ids = [...manifest[1].matchAll(/\bid:\s*(['"])(.*?)\1/g)].map(([, , id]) => id);

  assert.ok(ids.length > 0, 'icon source manifest must contain entries');
  assert.equal(new Set(ids).size, ids.length, 'each icon may only be synchronized once');

  const gear = JSON.parse(await readFile(new URL('./fixtures/wiki-gear-roster.json', import.meta.url), 'utf8'));
  const rows = manifest[1].split(/\r?\n/);
  for (const item of gear.entries.filter(({ icon }) => icon !== 'wiki-placeholder')) {
    const line = rows.find((row) => row.includes(`id: '${item.id}'`) || row.includes(`id: "${item.id}"`));
    assert.ok(line, `${item.id} must have an icon source`);
    const page = line.match(/page:\s*(['"])(.*?)\1/);
    assert.equal(page?.[2], item.englishPage.title, `${item.id} icon source article`);
    assert.ok(line.includes(`File:${item.iconTitle}`), `${item.id} icon source file`);
  }
  assert.ok(ids.includes('soul-bullet'), 'Soul Bullet marker must have a Wiki icon source');
  assert.doesNotMatch(manifest[1], /page:\s*undefined/, 'icon sources must not have missing article titles');
});
