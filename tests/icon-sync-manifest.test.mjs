import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadCatalog } from '../tools/catalog.mjs';
import { wikiArticleTitleFromSource } from '../tools/wiki-page-title.mjs';

function normalizeWikiTitle(value) {
  return value.replace(/^File:/i, '').replaceAll('_', ' ').replace(/\s+/g, ' ').trim().toLocaleLowerCase('en-US');
}

test('Wiki icon source records and file mappings come from the SQLite registry', async () => {
  const { iconAssets } = loadCatalog();
  const manifest = JSON.parse(await readFile(new URL('../docs/wiki-icon-sync.json', import.meta.url), 'utf8'));
  const records = new Map(manifest.assets.map((record) => [record.id, record]));
  const ids = iconAssets.map(({ id }) => id);
  assert.equal(new Set(ids).size, ids.length, 'each icon may only be registered once');
  assert.equal(records.size, iconAssets.filter(({ provenance }) => provenance === 'wiki').length);

  for (const asset of iconAssets) {
    const record = records.get(asset.id);
    if (asset.provenance === 'wiki') {
      assert.ok(record, `${asset.id} source record`);
      assert.equal(record.localFile, `assets/${asset.file}`, `${asset.id} local file`);
      assert.equal(record.sourcePage, asset.sourcePage, `${asset.id} source page`);
      assert.equal(record.wikiFileTitle, asset.wikiFileTitle, `${asset.id} Wiki file title`);
    } else {
      assert.equal(record, undefined, `${asset.id} without a Wiki source has no sync record`);
    }
  }

  const gear = JSON.parse(await readFile(new URL('./fixtures/wiki-gear-roster.json', import.meta.url), 'utf8'));
  const assetsById = new Map(iconAssets.map((asset) => [asset.id, asset]));
  for (const item of gear.entries.filter(({ icon }) => icon !== 'wiki-placeholder')) {
    const asset = assetsById.get(item.id);
    assert.ok(asset, `${item.id} icon source`);
    const syncPage = wikiArticleTitleFromSource(asset.sourcePage);
    assert.equal(syncPage, item.englishPage.title, `${item.id} sync article title`);
    const sourcePage = decodeURIComponent(new URL(asset.sourcePage).pathname.slice(3)).replaceAll('_', ' ');
    assert.equal(sourcePage, item.englishPage.title, `${item.id} icon source article`);
    assert.equal(normalizeWikiTitle(asset.wikiFileTitle), normalizeWikiTitle(`File:${item.iconTitle}`), `${item.id} icon source file`);
  }
  assert.ok(assetsById.has('soul-bullet'), 'Soul Bullet marker must have a Wiki icon source');
});
