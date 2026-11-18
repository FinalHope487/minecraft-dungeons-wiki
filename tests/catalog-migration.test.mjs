import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { gunzipSync } from 'node:zlib';
import { migrateV5Catalog } from '../tools/migrate-v5-to-v6.mjs';
import { loadCatalog } from '../tools/catalog.mjs';

function readRows(database, query, ...parameters) {
  return database.prepare(query).all(...parameters).map((row) => Object.fromEntries(Object.entries(row)));
}

function readCoreSnapshot(path, version) {
  const database = new DatabaseSync(path, { readOnly: true, enableForeignKeyConstraints: true });
  try {
    assert.equal(database.prepare('PRAGMA user_version').get().user_version, version);
    const links = version === 5
      ? `SELECT link.id, link.entry_id, link.target_entry_id, link.position,
          text.language, text.label
        FROM entry_links link JOIN entry_link_translations text ON text.link_id = link.id
        ORDER BY link.entry_id, link.position, text.language`
      : `SELECT link.id,
          CASE link.direction WHEN 'forward' THEN relation.source_entry_id ELSE relation.target_entry_id END AS entry_id,
          CASE link.direction WHEN 'forward' THEN relation.target_entry_id ELSE relation.source_entry_id END AS target_entry_id,
          link.position, text.language, text.label
        FROM entry_links link JOIN entry_relations relation ON relation.id = link.relation_id
        JOIN relation_type_translations text ON text.relation_kind = relation.relation_kind
          AND text.direction = link.direction
        ORDER BY entry_id, link.position, text.language`;
    return {
      categories: readRows(database, 'SELECT id, icon, group_key, position FROM categories ORDER BY position'),
      categoryTranslations: readRows(database, 'SELECT category_id, language, label FROM category_translations ORDER BY category_id, language'),
      entries: readRows(database, `SELECT id, category_id, icon, tone, implemented, seasonal, position
        FROM entries ORDER BY position`),
      entryTranslations: readRows(database, 'SELECT entry_id, language, name, badge, description FROM entry_translations ORDER BY entry_id, language'),
      facts: readRows(database, 'SELECT id, entry_id, position FROM facts ORDER BY entry_id, position'),
      factTranslations: readRows(database, 'SELECT fact_id, language, label, value FROM fact_translations ORDER BY fact_id, language'),
      traits: readRows(database, 'SELECT id, entry_id, icon, position FROM traits ORDER BY entry_id, position'),
      traitTranslations: readRows(database, 'SELECT trait_id, language, label FROM trait_translations ORDER BY trait_id, language'),
      links: readRows(database, links),
      builtInEnchantments: readRows(database, `SELECT link_id, property_icon, tier, property_trait_id
        FROM entry_built_in_enchantments ORDER BY link_id`),
      sources: readRows(database, 'SELECT id, entry_id, label, url, position FROM entry_sources ORDER BY entry_id, position'),
    };
  } finally {
    database.close();
  }
}

test('v5 → v6 保留公開內容、排序、關聯、來源與內建附魔列', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'mcd-catalog-migration-'));
  const fixture = new URL('./fixtures/catalog-v5.sqlite.gz', import.meta.url);
  const v5Copy = join(directory, 'catalog-v5.sqlite');
  const v6Copy = join(directory, 'catalog-v6.sqlite');
  await writeFile(v5Copy, gunzipSync(await readFile(fixture)));
  try {
    const before = readCoreSnapshot(v5Copy, 5);
    const reservedOutput = join(directory, 'reserved.sqlite');
    await writeFile(reservedOutput, 'keep existing output');
    await assert.rejects(migrateV5Catalog(v5Copy, reservedOutput), /EEXIST/);
    assert.equal(await readFile(reservedOutput, 'utf8'), 'keep existing output');

    const result = await migrateV5Catalog(v5Copy, v6Copy);
    const after = readCoreSnapshot(v6Copy, 6);
    const originalFactIds = new Set(before.facts.map(({ id }) => id));
    const originalSourceIds = new Set(before.sources.map(({ id }) => id));
    assert.deepEqual({
      ...after,
      facts: after.facts.filter(({ id }) => originalFactIds.has(id)),
      factTranslations: after.factTranslations.filter(({ fact_id: factId }) => originalFactIds.has(factId)),
      sources: after.sources.filter(({ id }) => originalSourceIds.has(id)),
    }, before);
    assert.deepEqual(after.sources.filter(({ id }) => !originalSourceIds.has(id)).sort((left, right) => left.id - right.id), [
      { id: 4090, entry_id: 'leeching', label: 'Minecraft Wiki · Enchanted Mobs', url: 'https://minecraft.wiki/w/Dungeons%3AEnchanted?oldid=3747433', position: 3 },
      { id: 4091, entry_id: 'sharpness', label: 'Minecraft Wiki · Enchanted Mobs', url: 'https://minecraft.wiki/w/Dungeons%3AEnchanted?oldid=3747433', position: 3 },
      { id: 4092, entry_id: 'double-damage', label: 'Minecraft Wiki · Enchanted Mobs', url: 'https://minecraft.wiki/w/Dungeons%3AEnchanted?oldid=3747433', position: 6 },
      { id: 4093, entry_id: 'fast-attack', label: 'Minecraft Wiki · Enchanted Mobs', url: 'https://minecraft.wiki/w/Dungeons%3AEnchanted?oldid=3747433', position: 6 },
      { id: 4094, entry_id: 'quick', label: 'Minecraft Wiki · Enchanted Mobs', url: 'https://minecraft.wiki/w/Dungeons%3AEnchanted?oldid=3747433', position: 5 },
    ]);
    assert.deepEqual(after.facts.filter(({ id }) => !originalFactIds.has(id)).sort((left, right) => left.id - right.id), [
      { id: 3074, entry_id: 'leeching', position: 8 },
      { id: 3075, entry_id: 'sharpness', position: 8 },
      { id: 3076, entry_id: 'double-damage', position: 8 },
      { id: 3077, entry_id: 'fast-attack', position: 8 },
      { id: 3078, entry_id: 'quick', position: 8 },
    ]);
    assert.equal(result.entries, 446);
    assert.equal(result.facts, 1325);
    assert.equal(result.relations, 286);
    assert.equal(result.icons, 426);

    const catalog = loadCatalog(v6Copy);
    assert.equal(catalog.entries.filter(({ category }) => category === 'enchantments').length, 124);
    assert.equal(catalog.entries.filter(({ enchantmentEffectProfile }) => enchantmentEffectProfile).length, 124);
    assert.equal(catalog.entries.flatMap(({ links }) => links).length, 572);
    assert.equal(catalog.entries.flatMap(({ links }) => links).filter(({ builtInEnchantment }) => builtInEnchantment).length, 117);

    const database = new DatabaseSync(v6Copy, { enableForeignKeyConstraints: true });
    try {
      assert.deepEqual(database.prepare('PRAGMA integrity_check').all().map((row) => row.integrity_check), ['ok']);
      assert.deepEqual(database.prepare('PRAGMA foreign_key_check').all(), []);
      assert.deepEqual(readRows(database, `SELECT entry_id, semantic_key, count(*) AS n FROM facts
        GROUP BY entry_id, semantic_key HAVING n > 1 ORDER BY entry_id`), [
        { entry_id: 'double-damage', semantic_key: 'mob_effect', n: 2 },
        { entry_id: 'fast-attack', semantic_key: 'mob_effect', n: 2 },
        { entry_id: 'leeching', semantic_key: 'mob_effect', n: 2 },
        { entry_id: 'quick', semantic_key: 'mob_effect', n: 2 },
        { entry_id: 'sharpness', semantic_key: 'mob_effect', n: 2 },
      ]);
      assert.ok(database.prepare('PRAGMA index_list(facts)').all().some(({ name, unique }) =>
        name === 'facts_by_semantic_key' && unique === 0));
      const duplicate = database.prepare(`INSERT INTO facts(entry_id, semantic_key, claim_origin, wiki_status, position)
        VALUES('ambush', 'player_effect', 'unknown', 'unknown', 999)`).run();
      assert.equal(database.prepare('SELECT COUNT(*) AS n FROM facts WHERE entry_id=? AND semantic_key=?')
        .get('ambush', 'player_effect').n, 2);
      database.prepare('DELETE FROM facts WHERE id=?').run(duplicate.lastInsertRowid);
      const regularRecipe = database.prepare('SELECT overlay_percent, frame_style FROM icon_recipes WHERE id=?')
        .get('built_in_enchantment');
      assert.equal(regularRecipe.overlay_percent, 81);
      assert.equal(regularRecipe.frame_style, 'none');
      assert.equal(database.prepare('SELECT frame_style FROM icon_recipes WHERE id=?')
        .get('built_in_enchantment_unique')?.frame_style, 'none');
      assert.equal(database.prepare("SELECT effect_relation FROM enchantment_effect_profiles WHERE entry_id='critical-hit'").get().effect_relation, 'unknown');
      const relation = (entryId) => database.prepare('SELECT effect_relation FROM enchantment_effect_profiles WHERE entry_id=?').get(entryId).effect_relation;
      assert.equal(relation('ambush'), 'unknown');
      assert.equal(relation('jungle-poison'), 'unknown');
      assert.equal(database.prepare(`SELECT COUNT(*) AS n FROM enchantment_effect_profiles
        WHERE effect_relation <> 'unknown'`).get().n, 0,
        'historical v5 migrations must not seed unaudited same/different relations');
      assert.equal(database.prepare("SELECT count(*) AS n FROM entries WHERE description_status='unknown'").get().n, 0);
      for (const [entryId, legacyFactId, effectFactId, legacyEn, legacyZh, effectEn, effectZh] of [
        ['leeching', 2198, 3074, 'Ancient mobs gain a portion of the hero’s health whenever they attack; the Wiki history also mentions Mystery Banner mobs.', '遠古怪物每次攻擊會取得英雄生命值的一部分；Wiki 更新紀錄亦提到神秘旗幟怪物。', 'Mobs gain a percent of the hero’s health every time they attack.', '怪物每次攻擊都會取得英雄生命值的一部分。'],
        ['sharpness', 2255, 3075, 'Ancient mobs deal increased melee damage; the Wiki history also mentions Mystery Banner mobs.', '遠古怪物會造成額外近戰傷害；Wiki 更新紀錄亦提到神秘旗幟怪物。', 'Mob melee damage increases.', '提高怪物的近戰傷害。'],
        ['double-damage', 3056, 3076, 'Mobs deal twice as much damage to the hero. Enchanters can apply it to nearby mobs; the Tome can apply it to heroes and summons.', '怪物對英雄造成雙倍傷害。附魔師可施加給附近怪物；附魔師之書可施加給英雄與召喚物。', 'Mobs deal 2 times as much damage to the hero. Similar to the Strength potion.', '怪物對英雄造成 2 倍傷害，效果類似力量藥水。'],
        ['fast-attack', 3064, 3077, 'Increases the mob’s attack speed. Enchanters can apply it to nearby mobs; the Tome can apply it to heroes and summons.', '提高怪物攻擊速度。附魔師可施加給附近怪物；附魔師之書可施加給英雄與召喚物。', 'Mob attack speed increases.', '提高怪物攻擊速度。'],
        ['quick', 3072, 3078, 'Increases the mob’s movement speed. The Tome can also apply it to heroes and summoned allies.', '提高怪物移動速度。附魔師之書也可將此效果施加給英雄與召喚盟友。', 'Mobs have higher movement speed. Similar to Swiftness.', '怪物移動速度提高，效果類似迅捷藥水。'],
      ]) {
        const legacy = database.prepare(`SELECT facts.claim_origin AS claimOrigin, translation.value
          FROM facts JOIN fact_translations translation ON translation.fact_id=facts.id
          WHERE facts.id=? AND translation.language='en'`).get(legacyFactId);
        assert.equal(legacy.claimOrigin, 'inference', `${entryId} original composite claim origin`);
        assert.equal(legacy.value, legacyEn, `${entryId} original composite claim text`);
        assert.deepEqual(readRows(database, `SELECT language, value FROM fact_translations
          WHERE fact_id=? ORDER BY language`, legacyFactId).map(({ language, value }) => ({ language, value })), [
          { language: 'en', value: legacyEn }, { language: 'zh-Hant', value: legacyZh },
        ], `${entryId} original composite translations`);
        const effect = database.prepare(`SELECT facts.claim_origin AS claimOrigin, translation.value
          FROM facts JOIN fact_translations translation ON translation.fact_id=facts.id
          WHERE facts.id=? AND translation.language='en'`).get(effectFactId);
        assert.equal(effect.claimOrigin, 'source', `${entryId} pure effect claim origin`);
        assert.equal(effect.value, effectEn, `${entryId} pure effect claim text`);
        assert.deepEqual(readRows(database, `SELECT language, value FROM fact_translations
          WHERE fact_id=? ORDER BY language`, effectFactId).map(({ language, value }) => ({ language, value })), [
          { language: 'en', value: effectEn }, { language: 'zh-Hant', value: effectZh },
        ], `${entryId} pure effect translations`);
        assert.equal(database.prepare('SELECT mob_fact_id FROM enchantment_effect_profiles WHERE entry_id=?').get(entryId).mob_fact_id,
          effectFactId, `${entryId} profile points to the pure effect claim`);
        assert.equal(database.prepare(`SELECT COUNT(*) AS n FROM fact_evidence
          WHERE fact_id=? AND relation='supports'`).get(legacyFactId).n, 0, `${entryId} composite has no direct support`);
        assert.deepEqual(readRows(database, `SELECT source.label, source.url FROM fact_evidence evidence
          JOIN entry_sources source ON source.id=evidence.source_id
          WHERE evidence.fact_id=? AND evidence.relation='supports'`, effectFactId), [
          { label: 'Minecraft Wiki · Enchanted Mobs', url: 'https://minecraft.wiki/w/Dungeons%3AEnchanted?oldid=3747433' },
        ]);
      }
      assert.equal(database.prepare("SELECT COUNT(*) AS n FROM fact_evidence WHERE relation='context'").get().n > 0, true);
      assert.equal(database.prepare(`SELECT COUNT(*) AS n FROM facts fact
        WHERE fact.claim_origin='source' AND NOT EXISTS (
          SELECT 1 FROM fact_evidence evidence WHERE evidence.fact_id=fact.id AND evidence.relation='supports'
        )`).get().n, 0);
    } finally {
      database.close();
    }

    const original = new DatabaseSync(v5Copy, { readOnly: true });
    try { assert.equal(original.prepare('PRAGMA user_version').get().user_version, 5); } finally { original.close(); }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('複合效果原文不符時拒絕遷移且保留 v5 輸入', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'mcd-catalog-composite-mismatch-'));
  const v5Copy = join(directory, 'catalog-v5.sqlite');
  const v6Copy = join(directory, 'catalog-v6.sqlite');
  await writeFile(v5Copy, gunzipSync(await readFile(new URL('./fixtures/catalog-v5.sqlite.gz', import.meta.url))));
  const changedValue = 'Edited legacy composite effect for rejection test.';
  try {
    const original = new DatabaseSync(v5Copy);
    try {
      original.prepare(`UPDATE fact_translations SET value=? WHERE fact_id=? AND language='en'`)
        .run(changedValue, 2198);
    } finally {
      original.close();
    }

    await assert.rejects(migrateV5Catalog(v5Copy, v6Copy), /fact 2198 與已查核的複合怪物效果原文不符/);
    await assert.rejects(access(v6Copy), { code: 'ENOENT' }, 'failed migration removes its partial output');
    const unchangedInput = new DatabaseSync(v5Copy, { readOnly: true });
    try {
      assert.equal(unchangedInput.prepare('PRAGMA user_version').get().user_version, 5);
      assert.equal(unchangedInput.prepare(`SELECT value FROM fact_translations
        WHERE fact_id=? AND language='en'`).get(2198).value, changedValue);
    } finally {
      unchangedInput.close();
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('遷移不把未知英文標籤自動轉成語意或來源主張', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'mcd-catalog-unknown-label-'));
  const v5Copy = join(directory, 'catalog-v5.sqlite');
  const v6Copy = join(directory, 'catalog-v6.sqlite');
  await writeFile(v5Copy, gunzipSync(await readFile(new URL('./fixtures/catalog-v5.sqlite.gz', import.meta.url))));
  try {
    const database = new DatabaseSync(v5Copy);
    let targetFactId;
    try {
      const fact = database.prepare('SELECT id FROM facts WHERE entry_id=? ORDER BY position LIMIT 1').get('critical-hit');
      targetFactId = fact.id;
      database.prepare('UPDATE fact_translations SET label=CASE language WHEN ? THEN ? ELSE ? END WHERE fact_id=?')
        .run('en', 'Legacy unclassified field', '舊版未分類欄位', fact.id);
    } finally {
      database.close();
    }

    await migrateV5Catalog(v5Copy, v6Copy);
    const migrated = new DatabaseSync(v6Copy, { readOnly: true });
    try {
      const fact = migrated.prepare('SELECT semantic_key, claim_origin FROM facts WHERE id=?').get(targetFactId);
      assert.equal(fact.semantic_key, 'unknown');
      assert.equal(fact.claim_origin, 'unknown');
    } finally {
      migrated.close();
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('Ambush 怪物效果只由實際記載效果的 Enchanted Mobs 頁支持', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'mcd-catalog-ambush-evidence-'));
  const v5Copy = join(directory, 'catalog-v5.sqlite');
  const v6Copy = join(directory, 'catalog-v6.sqlite');
  await writeFile(v5Copy, gunzipSync(await readFile(new URL('./fixtures/catalog-v5.sqlite.gz', import.meta.url))));
  try {
    await migrateV5Catalog(v5Copy, v6Copy);
    const database = new DatabaseSync(v6Copy, { readOnly: true });
    try {
      const evidence = database.prepare(`SELECT source.label, evidence.relation
        FROM facts fact JOIN fact_evidence evidence ON evidence.fact_id = fact.id
        JOIN entry_sources source ON source.id = evidence.source_id
        WHERE fact.entry_id = 'ambush' AND fact.semantic_key = 'mob_effect'
        ORDER BY source.position`).all();
      assert.deepEqual(evidence.filter(({ relation }) => relation === 'supports').map(({ label }) => label), [
        'Minecraft Wiki · Enchanted Mobs',
      ]);
      assert.equal(evidence.some(({ label, relation }) => label === 'Minecraft Wiki · Ambush' && relation === 'supports'), false);
      const fact = database.prepare(`SELECT wiki_status FROM facts
        WHERE entry_id = 'ambush' AND semantic_key = 'mob_effect'`).get();
      assert.equal(fact.wiki_status, 'verify');
    } finally {
      database.close();
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('同名 Wiki 單品頁不會自動支持未查核的 fact', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'mcd-catalog-unverified-source-'));
  const v5Copy = join(directory, 'catalog-v5.sqlite');
  const v6Copy = join(directory, 'catalog-v6.sqlite');
  await writeFile(v5Copy, gunzipSync(await readFile(new URL('./fixtures/catalog-v5.sqlite.gz', import.meta.url))));
  try {
    const original = new DatabaseSync(v5Copy);
    let factId;
    try {
      factId = original.prepare(`SELECT fact.id FROM facts fact
        JOIN fact_translations translation ON translation.fact_id = fact.id
        WHERE fact.entry_id = 'freezing' AND translation.language = 'en' AND translation.label = 'Mob availability'`).get().id;
      original.prepare(`UPDATE fact_translations SET value = ? WHERE fact_id = ? AND language = 'en'`)
        .run('Unreviewed claim that is not present on the Ambush page.', factId);
    } finally {
      original.close();
    }

    await migrateV5Catalog(v5Copy, v6Copy);
    const migrated = new DatabaseSync(v6Copy, { readOnly: true });
    try {
      const fact = migrated.prepare('SELECT claim_origin FROM facts WHERE id = ?').get(factId);
      assert.equal(fact.claim_origin, 'unknown');
      const evidence = migrated.prepare(`SELECT source.label, evidence.relation
        FROM fact_evidence evidence JOIN entry_sources source ON source.id = evidence.source_id
        WHERE evidence.fact_id = ? ORDER BY source.position`).all(factId);
      assert.ok(evidence.length > 0);
      assert.ok(evidence.every(({ relation }) => relation === 'context'));
    } finally {
      migrated.close();
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('同 semantic_key 的 fact 各自依 fact ID 保留來源證據', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'mcd-catalog-fact-id-evidence-'));
  const v5Copy = join(directory, 'catalog-v5.sqlite');
  const v6Copy = join(directory, 'catalog-v6.sqlite');
  await writeFile(v5Copy, gunzipSync(await readFile(new URL('./fixtures/catalog-v5.sqlite.gz', import.meta.url))));
  try {
    const original = new DatabaseSync(v5Copy);
    let reviewedFactId;
    let unreviewedFactId;
    try {
      reviewedFactId = original.prepare(`SELECT fact.id FROM facts fact
        JOIN fact_translations translation ON translation.fact_id = fact.id
        WHERE fact.entry_id = 'ambush' AND translation.language = 'en' AND translation.label = 'Mob effect'`).get().id;
      unreviewedFactId = Number(original.prepare('INSERT INTO facts(entry_id, position) VALUES(?, ?)')
        .run('ambush', 99).lastInsertRowid);
      for (const [language, value] of [
        ['en', 'A second, unreviewed mob effect claim.'],
        ['zh-Hant', '第二筆尚未查核的怪物效果主張。'],
      ]) {
        original.prepare('INSERT INTO fact_translations(fact_id, language, label, value) VALUES(?, ?, ?, ?)')
          .run(unreviewedFactId, language, language === 'en' ? 'Mob effect' : '怪物效果', value);
      }
    } finally {
      original.close();
    }

    await migrateV5Catalog(v5Copy, v6Copy);
    const migrated = new DatabaseSync(v6Copy, { readOnly: true });
    try {
      const facts = migrated.prepare(`SELECT id, claim_origin FROM facts
        WHERE entry_id = 'ambush' AND semantic_key = 'mob_effect' ORDER BY position`).all();
      assert.deepEqual(facts.map(({ id }) => id), [reviewedFactId, unreviewedFactId]);
      assert.deepEqual(facts.map(({ claim_origin }) => claim_origin), ['source', 'unknown']);

      const supports = migrated.prepare(`SELECT source.label FROM fact_evidence evidence
        JOIN entry_sources source ON source.id = evidence.source_id
        WHERE evidence.fact_id = ? AND evidence.relation = 'supports' ORDER BY source.position`);
      assert.deepEqual(supports.all(reviewedFactId).map(({ label }) => label), [
        'Minecraft Wiki · Enchanted Mobs',
      ]);
      assert.deepEqual(supports.all(unreviewedFactId), []);
      const contexts = migrated.prepare(`SELECT source.label FROM fact_evidence evidence
        JOIN entry_sources source ON source.id = evidence.source_id
        WHERE evidence.fact_id = ? AND evidence.relation = 'context' ORDER BY source.position`);
      assert.deepEqual(contexts.all(unreviewedFactId).map(({ label }) => label), [
        'Minecraft Wiki · Enchantment',
        'Minecraft Wiki · Ambush',
        'Minecraft Wiki · Enchanted Mobs',
        'Minecraft Wiki · Daily Trial',
      ]);
    } finally {
      migrated.close();
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
