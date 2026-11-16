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
});
