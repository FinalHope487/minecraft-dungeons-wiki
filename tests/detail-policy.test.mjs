import test from 'node:test';
import assert from 'node:assert/strict';
import { copyFile, mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { loadCatalog, validateCatalog, writeCatalogArtifacts } from '../tools/catalog.mjs';
import { createFileAppSource } from '../tools/file-app.mjs';

const catalogPath = new URL('../content/catalog.sqlite', import.meta.url);

test('詳情政策按來源性質分類，固定主要資訊→關聯→更多資訊→來源', () => {
  const catalog = loadCatalog();
  assert.doesNotThrow(() => JSON.stringify(catalog), '完整目錄須能匯出成 JSON');
  const byId = new Map(catalog.entries.map((entry) => [entry.id, entry]));
  const ambush = byId.get('ambush');
  const fact = (entry, key) => entry.facts.find((item) => item.semanticKey === key);

  assert.equal(fact(ambush, 'applicable_to').claimOrigin, 'source');
  assert.ok(ambush.presentation.primaryFacts.some(({ semanticKey }) => semanticKey === 'applicable_to'));
  assert.equal(fact(ambush, 'wiki_section').claimOrigin, 'source');
  assert.ok(ambush.presentation.primaryFacts.some(({ semanticKey }) => semanticKey === 'wiki_section'));
  assert.equal(fact(ambush, 'player_availability').claimOrigin, 'source');
  assert.ok(ambush.presentation.primaryFacts.some(({ semanticKey }) => semanticKey === 'player_availability'));
  for (const key of ['audience', 'evidence_confidence', 'mob_availability']) {
    assert.equal(fact(ambush, key).claimOrigin, 'inference', key);
    assert.ok(ambush.presentation.moreInfoFacts.some((item) => item.semanticKey === key), key);
  }
  assert.equal(fact(ambush, 'mob_effect').claimOrigin, 'source');
  assert.equal(fact(ambush, 'mob_effect').wikiStatus, 'verify');
  assert.ok(fact(ambush, 'mob_effect').evidence.some(({ relation }) => relation === 'supports'));
  assert.equal(ambush.enchantmentEffectProfile.mobAvailability, 'unknown');
  assert.equal(ambush.enchantmentEffectProfile.effectRelation, 'unknown');
  assert.deepEqual(ambush.presentation.effects.map(({ side, availabilityUnconfirmed }) => [side, availabilityUnconfirmed]), [
    ['player', false], ['mob', true],
  ]);
  assert.equal(ambush.presentation.unresolvedRelations.length, 1);
  assert.equal(ambush.presentation.unresolvedRelations[0].reason, 'relation');
  assert.equal(ambush.presentation.relationAssessment, null);

  const sectionTypes = ambush.presentation.sections.map(({ type }) => type);
  assert.deepEqual(sectionTypes, ['effects', 'facts', 'related', 'more_info', 'sources']);
  assert.equal(ambush.presentation.sections.some(({ type }) => type === 'description'), false);

  const critical = byId.get('critical-hit');
  assert.equal(critical.enchantmentEffectProfile.effectRelation, 'different');
  assert.deepEqual(critical.presentation.effects.map(({ side, sameAsPlayer }) => [side, sameAsPlayer ?? false]), [
    ['player', false], ['mob', false],
  ]);
  assert.deepEqual(critical.presentation.relationAssessment, { relation: 'different' });
  const criticalMoreInfo = critical.presentation.sections.find(({ type }) => type === 'more_info');
  assert.deepEqual(criticalMoreInfo.relationAssessment, { relation: 'different' });
  const unconfirmed = byId.get('freezing');
  assert.equal(unconfirmed.enchantmentEffectProfile.effectRelation, 'unknown');
  assert.deepEqual(unconfirmed.presentation.effects.map(({ side }) => side), ['player', 'mob']);
  assert.equal(unconfirmed.presentation.unresolvedRelations.length, 1);
  assert.equal(unconfirmed.presentation.relationAssessment, null);
  for (const id of [
    'bonus-shot', 'freezing', 'ricochet', 'radiance', 'frenzied',
    'burning', 'chilling', 'rush', 'tempo-theft',
    'chain-reaction', 'multishot', 'poison-cloud', 'fuse-shot',
    'chains', 'deflect', 'echo',
  ]) {
    const entry = byId.get(id);
    assert.equal(entry.enchantmentEffectProfile.effectRelation, 'unknown', `${id} relation stays unconfirmed`);
    assert.deepEqual(entry.presentation.effects.map(({ side }) => side), ['player', 'mob'], `${id} shows both sourced effects`);
    assert.equal(entry.presentation.unresolvedRelations.length, 1, `${id} relation warning is visible`);
  }
  assert.match(byId.get('frenzied').presentation.effects.find(({ side }) => side === 'mob').fact.value.en, /50%/,
    'Frenzied mob-specific 50% remains in the primary effect list');
  const inferredMobEffect = fact(byId.get('guarding-strike'), 'mob_effect');
  assert.equal(inferredMobEffect.claimOrigin, 'inference');
  assert.ok(byId.get('guarding-strike').presentation.moreInfoFacts.some(({ id }) => id === inferredMobEffect.id));

  for (const [id, legacyFactId] of [
    ['leeching', 2198], ['sharpness', 2255], ['double-damage', 3056], ['fast-attack', 3064], ['quick', 3072],
  ]) {
    const entry = byId.get(id);
    const legacy = entry.facts.find(({ id: factId }) => factId === legacyFactId);
    const profileEffect = entry.facts.find(({ id: factId }) => factId === entry.enchantmentEffectProfile.mobFactId);
    assert.equal(legacy.claimOrigin, 'inference', `${id} original composite remains an inference`);
    assert.ok(entry.presentation.moreInfoFacts.some(({ id: factId }) => factId === legacyFactId), `${id} original composite is in collapsed more info`);
    assert.equal(profileEffect.claimOrigin, 'source', `${id} displayed mob effect uses the separate source fact`);
    assert.equal(entry.presentation.effects.find(({ side }) => side === 'mob').fact.id, profileEffect.id,
      `${id} primary effect references the pure source fact`);
  }

  for (const entry of catalog.entries) {
    const primaryPositions = entry.presentation.primaryFacts.map(({ position }) => position);
    const moreInfoPositions = entry.presentation.moreInfoFacts.map(({ position }) => position);
    assert.deepEqual(primaryPositions, [...primaryPositions].sort((a, b) => a - b), `${entry.id} SQL primary order`);
    assert.deepEqual(moreInfoPositions, [...moreInfoPositions].sort((a, b) => a - b), `${entry.id} SQL assessment order`);
    const types = entry.presentation.sections.map(({ type }) => type);
    if (types.includes('related')) assert.ok(types.indexOf('related') < types.indexOf('more_info') || !types.includes('more_info'));
    if (types.includes('more_info')) assert.ok(types.indexOf('more_info') < types.indexOf('sources'));
  }
});

test('SQL 資料變更同步到 JSON 與 file:// bundle', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'mcd-catalog-export-'));
  const copy = join(directory, 'catalog.sqlite');
  const output = join(directory, 'dist');
  await copyFile(catalogPath, copy);
  try {
    let iconId;
    let updatedIconFile;
    const database = new DatabaseSync(copy);
    try {
      database.prepare(`UPDATE enchantment_effect_profiles SET effect_relation='different' WHERE entry_id=?`).run('freezing');
      database.prepare(`UPDATE enchantment_effect_profiles SET player_availability='unavailable' WHERE entry_id=?`).run('freezing');
      const iconRow = database.prepare('SELECT id, file FROM icon_assets ORDER BY id LIMIT 1').get();
      const registeredFiles = new Set(database.prepare('SELECT file FROM icon_assets').all().map(({ file }) => file));
      const availableFile = (await readdir(new URL('../assets/', import.meta.url))).find((file) => !registeredFiles.has(file));
      assert.ok(availableFile, 'test needs an unregistered but existing UI asset');
      database.prepare('UPDATE icon_assets SET file=? WHERE id=?').run(availableFile, iconRow.id);
      iconId = iconRow.id;
      updatedIconFile = availableFile;

      const facts = database.prepare(`SELECT id, position FROM facts WHERE entry_id=? AND semantic_key IN (?,?) ORDER BY position`).all(
        'ambush', 'applicable_to', 'wiki_section');
      assert.equal(facts.length, 2);
      database.prepare('UPDATE facts SET position=? WHERE id=?').run(99, facts[0].id);
      database.prepare('UPDATE facts SET position=? WHERE id=?').run(facts[0].position, facts[1].id);
      database.prepare('UPDATE facts SET position=? WHERE id=?').run(facts[1].position, facts[0].id);
    } finally {
      database.close();
    }

    const catalog = loadCatalog(copy);
    const assets = new Set(await readdir(new URL('../assets/', import.meta.url)));
    validateCatalog(catalog, assets);
    const entry = catalog.entries.find(({ id }) => id === 'ambush');
    assert.deepEqual(entry.presentation.primaryFacts.slice(0, 2).map(({ semanticKey }) => semanticKey), ['wiki_section', 'applicable_to']);
    assert.equal(catalog.entries.find(({ id }) => id === 'freezing').presentation.unresolvedRelations.length, 0);
    assert.deepEqual(catalog.entries.find(({ id }) => id === 'critical-hit').presentation.relationAssessment, { relation: 'different' });

    await writeCatalogArtifacts(output, { assetsDirectory: new URL('../assets/', import.meta.url), catalog });
    const index = JSON.parse(await readFile(join(output, 'data', 'catalog-index.json'), 'utf8'));
    const entries = Object.fromEntries(await Promise.all(catalog.entries.map(async ({ id }) => [
      id,
      JSON.parse(await readFile(join(output, 'data', 'entries', `${id}.json`), 'utf8')),
    ])));
    assert.equal(index.iconAssets.find(({ id }) => id === iconId).file, updatedIconFile);
    assert.deepEqual(entries.ambush.entry.presentation.primaryFacts.slice(0, 2).map(({ semanticKey }) => semanticKey),
      ['wiki_section', 'applicable_to']);
    assert.deepEqual(entries.freezing.entry.presentation.effects.map(({ side }) => side), ['mob']);

    const modules = Object.fromEntries(await Promise.all([
      ['routes', 'src/routes.mjs'], ['inventoryGrid', 'src/inventory-grid.mjs'],
      ['locale', 'src/locale.mjs'], ['iconAssets', 'src/icon-assets.mjs'], ['wiki', 'src/wiki.js'],
    ].map(async ([key, path]) => [key, await readFile(new URL(`../${path}`, import.meta.url), 'utf8')])));
    const bundle = createFileAppSource({ modules, catalog: { index, entries } });
    const embedded = JSON.parse(bundle.match(/^globalThis\.__WIKI_FILE_DATA__ = (.*);$/m)[1]);
    assert.deepEqual(embedded, { index, entries });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('來源主張必須有 supports 證據，並依 SQL position 保留重複語意事實', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'mcd-catalog-evidence-'));
  const copy = join(directory, 'catalog.sqlite');
  const output = join(directory, 'dist');
  await copyFile(catalogPath, copy);
  let existingFactId;
  try {
    const database = new DatabaseSync(copy);
    try {
      const existing = database.prepare('SELECT id, position FROM facts WHERE entry_id=? AND semantic_key=?').get('ambush', 'applicable_to');
      existingFactId = existing.id;
      const newFact = database.prepare(`INSERT INTO facts(entry_id, semantic_key, claim_origin, wiki_status, position)
        VALUES(?, ?, ?, ?, ?)`).run('ambush', 'mob_availability', 'source', 'unmarked', 99).lastInsertRowid;
      database.prepare('INSERT INTO fact_translations(fact_id, language, label, value) VALUES(?, ?, ?, ?)')
        .run(newFact, 'en', 'Mob availability', 'Melee enchanted mobs');
      database.prepare('INSERT INTO fact_translations(fact_id, language, label, value) VALUES(?, ?, ?, ?)')
        .run(newFact, 'zh-Hant', '怪物可用性', '近戰附魔怪物');
      const source = database.prepare('SELECT id FROM entry_sources WHERE entry_id=? AND label LIKE ?').get('ambush', '%Ambush');
      database.prepare('INSERT INTO fact_evidence(fact_id, source_id, relation) VALUES(?, ?, ?)').run(newFact, source.id, 'supports');

      const directSource = database.prepare('SELECT id FROM entry_sources WHERE entry_id=? AND label LIKE ?').get('ambush', '%Ambush');
      database.prepare('DELETE FROM fact_evidence WHERE fact_id=?').run(existing.id);
      database.prepare('INSERT INTO fact_evidence(fact_id, source_id, relation) VALUES(?, ?, ?)')
        .run(existing.id, directSource.id, 'context');
    } finally {
      database.close();
    }

    const catalog = loadCatalog(copy);
    const assets = new Set(await readdir(new URL('../assets/', import.meta.url)));
    assert.throws(() => validateCatalog(catalog, assets), /來源主張缺少支持證據/);
    assert.equal(catalog.entries.find(({ id }) => id === 'ambush').presentation.primaryFacts
      .some(({ id }) => id === existingFactId), false);
    const entry = catalog.entries.find(({ id }) => id === 'ambush');
    const sameKeyFacts = entry.facts.filter(({ semanticKey }) => semanticKey === 'mob_availability');
    assert.equal(sameKeyFacts.length, 2);
    assert.deepEqual(sameKeyFacts.map(({ position }) => position), [5, 99]);

    const evidenceDb = new DatabaseSync(copy);
    try {
      const directSource = evidenceDb.prepare('SELECT id FROM entry_sources WHERE entry_id=? AND label LIKE ?').get('ambush', '%Ambush');
      evidenceDb.prepare('INSERT INTO fact_evidence(fact_id, source_id, relation) VALUES(?, ?, ?)')
        .run(existingFactId, directSource.id, 'supports');
    } finally {
      evidenceDb.close();
    }
    const supportedCatalog = loadCatalog(copy);
    validateCatalog(supportedCatalog, assets);
    await writeCatalogArtifacts(output, { catalog: supportedCatalog });
    const exported = JSON.parse(await readFile(join(output, 'data', 'entries', 'ambush.json'), 'utf8')).entry;
    const exportedClaims = exported.facts.filter(({ semanticKey }) => semanticKey === 'mob_availability');
    assert.equal(exportedClaims.length, 2);
    assert.deepEqual(exportedClaims.map(({ position }) => position), [5, 99]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('單一關聯標籤與圖標配方修改會傳播至所有匯出條目', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'mcd-catalog-policy-'));
  const copy = join(directory, 'catalog.sqlite');
  await copyFile(catalogPath, copy);
  try {
    const database = new DatabaseSync(copy);
    try {
      database.prepare(`UPDATE relation_type_translations SET label=?
        WHERE relation_kind='weapon_enchantment' AND direction='forward' AND language='en'`).run('Associated enchantment');
      database.prepare('UPDATE icon_recipes SET overlay_percent=84 WHERE id=?').run('built_in_enchantment');
      database.prepare('UPDATE icon_recipes SET frame_style=? WHERE id=?').run('none', 'built_in_enchantment');
    } finally {
      database.close();
    }
    const updated = loadCatalog(copy);
    const assets = new Set(await readdir(new URL('../assets/', import.meta.url)));
    validateCatalog(updated, assets);
    const forwardLinks = updated.entries.flatMap(({ links }) => links)
      .filter(({ kind, direction }) => kind === 'weapon_enchantment' && direction === 'forward');
    assert.ok(forwardLinks.length > 0);
    assert.ok(forwardLinks.every(({ label }) => label.en === 'Associated enchantment'));
    assert.equal(updated.iconRecipes[0].overlayPercent, 84);
    assert.equal(updated.iconRecipes[0].frameStyle, 'none');
    assert.equal(updated.entries.flatMap(({ links }) => links)
      .filter(({ builtInEnchantment }) => builtInEnchantment).length, 117);

    const invalid = structuredClone(updated);
    invalid.entries.find(({ id }) => id === 'anchor').links.find(({ kind }) => kind === 'weapon_enchantment').kind = 'base_variant';
    assert.throws(() => validateCatalog(invalid, assets), /關聯端點種類錯誤/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
