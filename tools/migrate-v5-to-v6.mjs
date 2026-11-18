import { copyFile, open, readFile, rm } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const migrationSql = await readFile(new URL('../content/migrations/v5-to-v6-structured-catalog.sql', import.meta.url), 'utf8');
const iconSeed = JSON.parse(await readFile(new URL('../content/migrations/v5-icon-seed.json', import.meta.url), 'utf8'));

const canonicalKeys = new Map([
  ['Type', 'type'],
  ['Applicable to', 'applicable_to'],
  ['Wiki section', 'wiki_section'],
  ['Audience', 'audience'],
  ['Hero availability', 'player_availability'],
  ['Player effect', 'player_effect'],
  ['Mob availability', 'mob_availability'],
  ['Mob effect', 'mob_effect'],
  ['Evidence confidence', 'evidence_confidence'],
  ['Ranged name', 'ranged_name'],
  ['Cooldown', 'cooldown'],
  ['Fixed effects', 'fixed_effects'],
  ['Missions found in', 'missions_found_in'],
]);

// These v5 rows combine an effect with mob-access or history details. Preserve
// the original rows as inference, then create a distinct sourced effect row
// for the profile to reference. Match the frozen input text before transforming.
const compositeMobEffects = new Map([
  [2198, {
    entryId: 'leeching',
    original: {
      en: 'Ancient mobs gain a portion of the hero’s health whenever they attack; the Wiki history also mentions Mystery Banner mobs.',
      'zh-Hant': '遠古怪物每次攻擊會取得英雄生命值的一部分；Wiki 更新紀錄亦提到神秘旗幟怪物。',
    },
    effect: {
      en: 'Mobs gain a percent of the hero’s health every time they attack.',
      'zh-Hant': '怪物每次攻擊都會取得英雄生命值的一部分。',
    },
  }],
  [2255, {
    entryId: 'sharpness',
    original: {
      en: 'Ancient mobs deal increased melee damage; the Wiki history also mentions Mystery Banner mobs.',
      'zh-Hant': '遠古怪物會造成額外近戰傷害；Wiki 更新紀錄亦提到神秘旗幟怪物。',
    },
    effect: {
      en: 'Mob melee damage increases.',
      'zh-Hant': '提高怪物的近戰傷害。',
    },
  }],
  [3056, {
    entryId: 'double-damage',
    original: {
      en: 'Mobs deal twice as much damage to the hero. Enchanters can apply it to nearby mobs; the Tome can apply it to heroes and summons.',
      'zh-Hant': '怪物對英雄造成雙倍傷害。附魔師可施加給附近怪物；附魔師之書可施加給英雄與召喚物。',
    },
    effect: {
      en: 'Mobs deal 2 times as much damage to the hero. Similar to the Strength potion.',
      'zh-Hant': '怪物對英雄造成 2 倍傷害，效果類似力量藥水。',
    },
  }],
  [3064, {
    entryId: 'fast-attack',
    original: {
      en: 'Increases the mob’s attack speed. Enchanters can apply it to nearby mobs; the Tome can apply it to heroes and summons.',
      'zh-Hant': '提高怪物攻擊速度。附魔師可施加給附近怪物；附魔師之書可施加給英雄與召喚物。',
    },
    effect: {
      en: 'Mob attack speed increases.',
      'zh-Hant': '提高怪物攻擊速度。',
    },
  }],
  [3072, {
    entryId: 'quick',
    original: {
      en: 'Increases the mob’s movement speed. The Tome can also apply it to heroes and summoned allies.',
      'zh-Hant': '提高怪物移動速度。附魔師之書也可將此效果施加給英雄與召喚盟友。',
    },
    effect: {
      en: 'Mobs have higher movement speed. Similar to Swiftness.',
      'zh-Hant': '怪物移動速度提高，效果類似迅捷藥水。',
    },
  }],
]);
const effectSourceLabel = 'Minecraft Wiki · Enchanted Mobs';
const effectSourceUrl = 'https://minecraft.wiki/w/Dungeons%3AEnchanted?oldid=3747433';

// Only audited v5 fact IDs receive non-context evidence. Keep the expected
// claim beside each ID so edits to the frozen migration input cannot inherit
// stale provenance. Unmapped facts remain unknown/context until audited.
const factEvidenceById = new Map([
  [2080, {
    entryId: 'ambush',
    label: 'Applicable to',
    value: 'Melee',
    sources: new Map([
      ['Minecraft Wiki · Ambush', 'supports'],
    ]),
  }],
  [2081, {
    entryId: 'ambush',
    label: 'Wiki section',
    value: 'Hero-accessible',
    sources: new Map([
      ['Minecraft Wiki · Enchantment', 'supports'],
    ]),
  }],
  [2083, {
    entryId: 'ambush',
    label: 'Hero availability',
    value: 'Gear enchantment choice',
    sources: new Map([
      ['Minecraft Wiki · Ambush', 'supports'],
    ]),
  }],
  [2084, {
    entryId: 'ambush',
    label: 'Player effect',
    value: 'Attacks on mobs that are not actively targeting you deal increased damage.',
    sources: new Map([
      ['Minecraft Wiki · Ambush', 'supports'],
    ]),
  }],
  [2164, {
    entryId: 'freezing',
    label: 'Player effect',
    value: 'Slows mobs after hit for three seconds.',
    sources: new Map([
      ['Minecraft Wiki · Freezing', 'supports'],
    ]),
  }],
  [2166, {
    entryId: 'freezing',
    label: 'Mob effect',
    value: 'Hitting the hero slows the hero’s attack speed.',
    sources: new Map([
      ['Minecraft Wiki · Enchanted Mobs', 'supports'],
    ]),
  }],
  [2582, {
    entryId: 'burning',
    label: 'Player effect',
    value: 'Every 0.5 seconds damages all nearby enemies.',
    sources: new Map([
      ['Minecraft Wiki · Burning', 'supports'],
    ]),
  }],
  [2584, {
    entryId: 'burning',
    label: 'Mob effect',
    value: 'The mob emits an area that continuously damages nearby heroes.',
    sources: new Map([
      ['Minecraft Wiki · Enchanted Mobs', 'supports'],
    ]),
  }],
  [2085, {
    entryId: 'ambush',
    label: 'Mob availability',
    value: 'The Ambush page says mobs can receive Ambush in daily trials or from Mystery Banners carried by Raid Captains. Daily Trial lists Ambush for melee mobs; the enchantment overview marks mob obtainability ✖. Enchanted Mobs lists the Mystery Banner mob effect and marks it [verify].',
    sources: new Map([
      ['Minecraft Wiki · Enchantment', 'conflicts'],
      ['Minecraft Wiki · Ambush', 'supports'],
      ['Minecraft Wiki · Daily Trial', 'supports'],
    ]),
  }],
  [2086, {
    entryId: 'ambush',
    label: 'Mob effect',
    value: 'Mob inflicts extra damage on unsuspecting heroes.',
    sources: new Map([
      ['Minecraft Wiki · Enchanted Mobs', 'supports'],
    ]),
  }],
  [2309, {
    entryId: 'critical-hit',
    label: 'Player effect',
    value: '10% / 15% / 20% chance (tiers I / II / III) to deal triple damage.',
    sources: new Map([
      ['Minecraft Wiki · Critical Hit', 'supports'],
    ]),
  }],
  [2311, {
    entryId: 'critical-hit',
    label: 'Mob effect',
    value: 'Mobs always deal triple their normal damage when attacking; the Wiki says this is guaranteed, unlike the player’s 10% / 15% / 20% tier chances.',
    sources: new Map([
      ['Minecraft Wiki · Critical Hit', 'supports'],
    ]),
  }],
]);

function semanticKey(label) {
  return canonicalKeys.get(label) ?? 'unknown';
}

function claimOrigin(label, value, hasSupportingSource) {
  if (['Audience', 'Evidence confidence'].includes(label)) return 'inference';
  if (label === 'Mob availability'
    && (/^(?:No enemy-mob use is listed|Unconfirmed:)/i.test(value)
      || /(?:page says|wiki (?:history|table|article|overview)|history also|main table|conflict|unclear|while .* marks|though .* unclear|marked \[verify\])/i.test(value))) {
    return 'inference';
  }
  if (label === 'Mob effect'
    && (/^(?:No mob-side effect is listed|Unconfirmed:)/i.test(value)
      || /(?:pages? conflict|wiki pages conflict|current interval is unclear|wiki does not describe|history records)/i.test(value))) {
    return 'inference';
  }
  return canonicalKeys.has(label) && hasSupportingSource ? 'source' : 'unknown';
}

function wikiStatus(label, value, entryFacts) {
  if (!['Player effect', 'Mob effect', 'Mob availability'].includes(label)) return 'unmarked';
  if (/\[(?:verify|unverified)\]/i.test(value)
    || /(?:marks?|marked|labelled|labeled) (?:this |the )?(?:behavior|effect|availability|row) as unverified/i.test(value)) {
    return 'verify';
  }
  if (label === 'Mob effect') {
    const confidence = entryFacts.find((fact) => fact.label === 'Evidence confidence')?.value ?? '';
    if (/\[verify\]/i.test(confidence) && /\b(?:mob|monster|banner)\b/i.test(value)) return 'verify';
  }
  return 'unmarked';
}

function playerAvailability(value) {
  if (value === 'Unavailable to heroes') return 'unavailable';
  if (['Gear enchantment choice', 'Built into Unique gear only', "Granted to heroes by Enchanter's Tome; not a gear choice"].includes(value)) {
    return 'available';
  }
  return 'unknown';
}

function mobAvailability(value) {
  if (!value || /^(?:No enemy-mob use is listed|Unconfirmed:)/i.test(value)
    || /(?:✖|\bconflict\b|\bunclear\b|\bwhile\b|\bthough\b|history also|main table)/i.test(value)) {
    return 'unknown';
  }
  return 'available';
}

function relationFor(label, kind) {
  if (kind === 'base_variant') {
    if (label === 'Unique variant') return 'forward';
    if (label === 'Base item') return 'reverse';
  } else if (kind === 'weapon_enchantment') {
    if (label === 'Related enchantment') return 'forward';
    if (label === 'Gear with this built-in effect') return 'reverse';
  }
  throw new Error(`無法正規化條目關聯標籤：${kind}/${label}`);
}

function relationKind(label) {
  if (label === 'Unique variant' || label === 'Base item') return 'base_variant';
  if (label === 'Related enchantment' || label === 'Gear with this built-in effect') return 'weapon_enchantment';
  throw new Error(`未知的關聯種類：${label}`);
}

function localizedRelationRows(links) {
  const relationTexts = new Map();
  for (const link of links) {
    const label = link.translations.en;
    const kind = relationKind(label);
    const direction = relationFor(label, kind);
    for (const language of ['en', 'zh-Hant']) {
      const translated = link.translations[language];
      if (!translated) throw new Error(`關聯 ${link.id} 缺少 ${language} 標籤。`);
      const key = `${kind}|${direction}|${language}`;
      const previous = relationTexts.get(key);
      if (previous && previous !== translated) throw new Error(`關聯類型翻譯不一致：${key}`);
      relationTexts.set(key, translated);
    }
  }
  return [...relationTexts].map(([key, label]) => {
    const [kind, direction, language] = key.split('|');
    return { kind, direction, language, label };
  });
}

function readV5(path) {
  const db = new DatabaseSync(path, { readOnly: true, enableForeignKeyConstraints: true });
  try {
    const version = db.prepare('PRAGMA user_version').get().user_version;
    if (version !== 5) throw new Error(`遷移來源需為 schema v5，實際為 v${version}。`);
    const integrity = db.prepare('PRAGMA integrity_check').all();
    if (integrity.length !== 1 || integrity[0].integrity_check !== 'ok') throw new Error('v5 資料庫完整性檢查失敗。');
    const foreignKeys = db.prepare('PRAGMA foreign_key_check').all();
    if (foreignKeys.length) throw new Error(`v5 資料庫有 ${foreignKeys.length} 筆外鍵錯誤。`);

    const factTranslations = db.prepare('SELECT fact_id, language, label, value FROM fact_translations').all();
    const translationByFact = new Map();
    for (const row of factTranslations) {
      if (!translationByFact.has(row.fact_id)) translationByFact.set(row.fact_id, {});
      translationByFact.get(row.fact_id)[row.language] = { label: row.label, value: row.value };
    }
    const facts = db.prepare('SELECT id, entry_id, position FROM facts ORDER BY entry_id, position').all().map((fact) => ({
      ...fact,
      label: translationByFact.get(fact.id)?.en?.label,
      value: translationByFact.get(fact.id)?.en?.value,
      translations: translationByFact.get(fact.id),
    }));
    const groupedFacts = new Map();
    for (const fact of facts) {
      const list = groupedFacts.get(fact.entry_id) ?? [];
      list.push(fact);
      groupedFacts.set(fact.entry_id, list);
    }
    const sources = db.prepare('SELECT id, entry_id, label, url, position FROM entry_sources ORDER BY entry_id, position').all();
    const sourcesByEntry = new Map();
    for (const source of sources) {
      const list = sourcesByEntry.get(source.entry_id) ?? [];
      list.push(source);
      sourcesByEntry.set(source.entry_id, list);
    }
    const entryTranslations = db.prepare('SELECT entry_id, language, name, description FROM entry_translations').all();
    const descriptionByEntry = new Map();
    for (const row of entryTranslations) {
      if (row.language === 'en') {
        descriptionByEntry.set(row.entry_id, row.description);
      }
    }
    const oldLinks = db.prepare(`SELECT l.id, l.entry_id, l.target_entry_id, l.position, t.language, t.label
      FROM entry_links l JOIN entry_link_translations t ON t.link_id = l.id
      ORDER BY l.entry_id, l.position, t.language`).all();
    const linksById = new Map();
    for (const row of oldLinks) {
      const link = linksById.get(row.id) ?? { id: row.id, entryId: row.entry_id, targetId: row.target_entry_id, position: row.position, translations: {} };
      link.translations[row.language] = row.label;
      linksById.set(row.id, link);
    }
    const links = [...linksById.values()];
    const builtIns = db.prepare('SELECT link_id, property_icon, tier, property_trait_id FROM entry_built_in_enchantments').all();
    const entryCategories = new Map(db.prepare('SELECT id, category_id FROM entries').all().map((row) => [row.id, row.category_id]));
    return { facts, groupedFacts, sources, sourcesByEntry, links, builtIns, entryCategories, descriptionByEntry };
  } finally {
    db.close();
  }
}

function groupReciprocalLinks(links, entryCategories) {
  const groups = new Map();
  for (const link of links) {
    const endpoints = [link.entryId, link.targetId].sort();
    const key = endpoints.join('\0');
    const group = groups.get(key) ?? [];
    group.push(link);
    groups.set(key, group);
  }
  const result = [];
  for (const group of groups.values()) {
    if (group.length !== 2 || group[0].entryId !== group[1].targetId || group[0].targetId !== group[1].entryId) {
      throw new Error(`關聯無法無損配對，link ids=${group.map(({ id }) => id).join(',')}`);
    }
    const kinds = new Set(group.map(({ translations }) => relationKind(translations.en)));
    if (kinds.size !== 1) throw new Error(`關聯兩側類型不同：${group.map(({ id }) => id).join(',')}`);
    const kind = [...kinds][0];
    const byDirection = new Map(group.map((link) => [relationFor(link.translations.en, kind), link]));
    if (byDirection.size !== 2 || !byDirection.has('forward') || !byDirection.has('reverse')) {
      throw new Error(`關聯缺少正向或反向資料：${group.map(({ id }) => id).join(',')}`);
    }
    const forward = byDirection.get('forward');
    const sourceCategory = entryCategories.get(forward.entryId);
    const targetCategory = entryCategories.get(forward.targetId);
    const gearCategories = new Set(['equipment', 'ranged', 'armor']);
    if ((kind === 'base_variant' && (!gearCategories.has(sourceCategory) || !gearCategories.has(targetCategory)))
      || (kind === 'weapon_enchantment' && (!gearCategories.has(sourceCategory) || targetCategory !== 'enchantments'))) {
      throw new Error(`關聯端點種類錯誤：${forward.entryId} → ${forward.targetId} (${kind})`);
    }
    result.push({ id: Math.min(...group.map(({ id }) => id)), kind, forward, reverse: byDirection.get('reverse') });
  }
  return result;
}

function migrateData(db, old) {
  const updateFact = db.prepare('UPDATE facts SET semantic_key=?, claim_origin=?, wiki_status=? WHERE id=?');
  const insertEvidence = db.prepare('INSERT INTO fact_evidence(fact_id,source_id,relation) VALUES(?,?,?)');
  const seenEvidenceOverrides = new Set();
  for (const fact of old.facts) {
    if (!fact.label || !fact.value) throw new Error(`fact ${fact.id} 缺少英文標籤或值。`);
    const compositeEffect = compositeMobEffects.get(fact.id);
    if (compositeEffect) {
      const zh = fact.translations['zh-Hant'];
      if (fact.entry_id !== compositeEffect.entryId || fact.label !== 'Mob effect'
        || fact.value !== compositeEffect.original.en || zh?.label !== '怪物效果'
        || zh?.value !== compositeEffect.original['zh-Hant']) {
        throw new Error(`fact ${fact.id} 與已查核的複合怪物效果原文不符，拒絕拆分。`);
      }
    }
    const entrySources = old.sourcesByEntry.get(fact.entry_id) ?? [];
    const evidenceOverride = factEvidenceById.get(fact.id);
    const explicitRelations = new Map();
    if (evidenceOverride) {
      if (fact.entry_id !== evidenceOverride.entryId || fact.label !== evidenceOverride.label
        || fact.value !== evidenceOverride.value) {
        throw new Error(`fact ${fact.id} 與已查核來源映射不符，拒絕沿用證據。`);
      }
      seenEvidenceOverrides.add(fact.id);
      for (const [sourceLabel, relation] of evidenceOverride.sources) {
        const matches = entrySources.filter((source) => source.label === sourceLabel);
        if (matches.length !== 1) throw new Error(`fact ${fact.id} 找不到唯一來源：${sourceLabel}`);
        explicitRelations.set(matches[0].id, relation);
      }
    }
    const hasSupportingSource = [...explicitRelations.values()].includes('supports');
    const origin = compositeEffect ? 'inference' : claimOrigin(fact.label, fact.value, hasSupportingSource);
    const status = wikiStatus(fact.label, fact.value, old.groupedFacts.get(fact.entry_id) ?? []);
    updateFact.run(semanticKey(fact.label), origin, status, fact.id);
    for (const source of entrySources) {
      const relation = explicitRelations.get(source.id) ?? 'context';
      insertEvidence.run(fact.id, source.id, relation);
    }
  }
  for (const factId of factEvidenceById.keys()) {
    if (!seenEvidenceOverrides.has(factId)) throw new Error(`已查核來源映射指向不存在的 fact：${factId}`);
  }

  const effectFactIdByEntry = new Map();
  const insertEffectFact = db.prepare(`INSERT INTO facts(entry_id,semantic_key,claim_origin,wiki_status,position)
    VALUES(?, 'mob_effect', 'source', 'unmarked', ?)`);
  const insertEffectTranslation = db.prepare(`INSERT INTO fact_translations(fact_id,language,label,value)
    VALUES(?,?,?,?)`);
  const insertEffectSource = db.prepare(`INSERT INTO entry_sources(id,entry_id,label,url,position)
    VALUES(?,?,?,?,?)`);
  let nextSourceId = Math.max(0, ...old.sources.map(({ id }) => id)) + 1;
  for (const [factId, composite] of compositeMobEffects) {
    const entrySources = old.sourcesByEntry.get(composite.entryId) ?? [];
    const effectSources = entrySources.filter(({ label }) => label === effectSourceLabel);
    const pinnedSources = effectSources.filter(({ url }) => url === effectSourceUrl);
    if (pinnedSources.length > 1 || (pinnedSources.length === 0 && effectSources.length !== 1)) {
      throw new Error(`${composite.entryId} 找不到唯一的怪物效果來源：${effectSourceLabel}`);
    }
    const effectSource = pinnedSources[0] ?? (() => {
      const source = {
        id: nextSourceId++,
        entry_id: composite.entryId,
        label: effectSourceLabel,
        url: effectSourceUrl,
        position: Math.max(-1, ...entrySources.map(({ position }) => position)) + 1,
      };
      insertEffectSource.run(source.id, source.entry_id, source.label, source.url, source.position);
      return source;
    })();
    const position = Math.max(...(old.groupedFacts.get(composite.entryId) ?? []).map(({ position: value }) => value)) + 1;
    const inserted = insertEffectFact.run(composite.entryId, position);
    const effectFactId = Number(inserted.lastInsertRowid);
    for (const language of ['en', 'zh-Hant']) {
      insertEffectTranslation.run(effectFactId, language, language === 'en' ? 'Mob effect' : '怪物效果',
        language === 'en' ? composite.effect.en : composite.effect['zh-Hant']);
    }
    for (const source of [...entrySources, ...(entrySources.some(({ id }) => id === effectSource.id) ? [] : [effectSource])]) {
      insertEvidence.run(effectFactId, source.id, source.id === effectSource.id ? 'supports' : 'context');
    }
    effectFactIdByEntry.set(composite.entryId, effectFactId);
    if (!old.facts.some(({ id }) => id === factId)) throw new Error(`複合效果 fact 不存在：${factId}`);
  }

  const profileInsert = db.prepare(`INSERT INTO enchantment_effect_profiles
    (entry_id,player_availability,mob_availability,effect_relation,player_fact_id,mob_fact_id)
    VALUES(?,?,?,?,?,?)`);
  for (const [entryId, category] of old.entryCategories) {
    if (category !== 'enchantments') continue;
    const facts = old.groupedFacts.get(entryId) ?? [];
    const byLabel = new Map(facts.map((fact) => [fact.label, fact]));
    const hero = byLabel.get('Hero availability');
    const mobs = byLabel.get('Mob availability');
    const playerFact = byLabel.get('Player effect');
    const mobFact = byLabel.get('Mob effect');
    // v5 stores no relation audit. Keep every migrated relation unknown until
    // the current catalog's fact-level review is applied separately.
    const effectRelation = 'unknown';
    profileInsert.run(entryId, playerAvailability(hero?.value ?? ''), mobAvailability(mobs?.value ?? ''),
      effectRelation, playerFact?.id ?? null, effectFactIdByEntry.get(entryId) ?? mobFact?.id ?? null);
  }

  const descriptionUpdate = db.prepare(`UPDATE entries SET description_status=? WHERE id=?`);
  for (const [entryId, text] of old.descriptionByEntry) {
    descriptionUpdate.run(/^Wiki does not provide an in-game description\.?$/i.test(text.trim()) ? 'placeholder' : 'source', entryId);
  }

  const relationTranslations = localizedRelationRows(old.links);
  const relationInsert = db.prepare(`INSERT INTO entry_relations(id,relation_kind,source_entry_id,target_entry_id)
    VALUES(?,?,?,?)`);
  const linkInsert = db.prepare('INSERT INTO entry_links(id,relation_id,direction,position) VALUES(?,?,?,?)');
  const labelInsert = db.prepare(`INSERT INTO relation_type_translations(relation_kind,direction,language,label)
    VALUES(?,?,?,?)`);
  for (const relation of groupReciprocalLinks(old.links, old.entryCategories)) {
    relationInsert.run(relation.id, relation.kind, relation.forward.entryId, relation.forward.targetId);
    linkInsert.run(relation.forward.id, relation.id, 'forward', relation.forward.position);
    linkInsert.run(relation.reverse.id, relation.id, 'reverse', relation.reverse.position);
  }
  for (const row of relationTranslations) labelInsert.run(row.kind, row.direction, row.language, row.label);

  const builtInInsert = db.prepare(`INSERT INTO entry_built_in_enchantments(link_id,property_icon,tier,property_trait_id)
    VALUES(?,?,?,?)`);
  for (const row of old.builtIns) builtInInsert.run(row.link_id, row.property_icon, row.tier, row.property_trait_id);

  const iconInsert = db.prepare(`INSERT INTO icon_assets(id,file,kind,source_page,wiki_file_title,provenance)
    VALUES(?,?,?,?,?,?)`);
  for (const asset of iconSeed) iconInsert.run(asset.id, asset.file, asset.kind,
    asset.sourcePage, asset.wikiFileTitle, asset.provenance);
  db.prepare(`INSERT INTO icon_recipes(id,base_role,overlay_role,overlay_percent,frame_style)
    VALUES('built_in_enchantment','property_icon','target_entry_icon',81,'none'),
          ('built_in_enchantment_unique','property_icon','target_entry_icon',81,'none')`).run();

  db.exec(`DROP TABLE entry_built_in_enchantments_v5;
    DROP TABLE entry_link_translations_v5;
    DROP TABLE entry_links_v5;`);
  return { factsAdded: effectFactIdByEntry.size };
}

function validateMigratedDatabase(db) {
  const version = db.prepare('PRAGMA user_version').get().user_version;
  if (version !== 6) throw new Error(`遷移後版本錯誤：${version}`);
  const integrity = db.prepare('PRAGMA integrity_check').all();
  if (integrity.length !== 1 || integrity[0].integrity_check !== 'ok') throw new Error('v6 資料庫完整性檢查失敗。');
  const foreignKeys = db.prepare('PRAGMA foreign_key_check').all();
  if (foreignKeys.length) throw new Error(`v6 資料庫有 ${foreignKeys.length} 筆外鍵錯誤。`);
  const profiles = db.prepare(`SELECT COUNT(*) AS count FROM enchantment_effect_profiles`).get().count;
  const enchantments = db.prepare(`SELECT COUNT(*) AS count FROM entries WHERE category_id='enchantments'`).get().count;
  if (profiles !== enchantments) throw new Error(`附魔效果 profile 數量不符：${profiles}/${enchantments}`);
  const relationCount = db.prepare('SELECT COUNT(*) AS count FROM entry_relations').get().count;
  const directionCount = db.prepare('SELECT COUNT(*) AS count FROM entry_links').get().count;
  if (directionCount !== relationCount * 2) throw new Error(`關聯方向數量不符：${directionCount}/${relationCount * 2}`);
  const iconCount = db.prepare('SELECT COUNT(*) AS count FROM icon_assets').get().count;
  if (iconCount !== iconSeed.length) throw new Error(`圖標登錄數量不符：${iconCount}/${iconSeed.length}`);
}

export async function migrateV5Catalog(inputPath, outputPath) {
  const input = resolve(inputPath);
  const output = resolve(outputPath);
  if (input === output) throw new Error('遷移輸出必須是新檔，不能覆寫 v5 來源。');
  if (basename(output).toLowerCase().endsWith('.sqlite') === false) throw new Error('遷移輸出必須是 SQLite 檔案。');
  const old = readV5(input);
  let writable;
  let rollbackError;
  let outputCreated = false;
  try {
    const outputHandle = await open(output, 'wx');
    outputCreated = true;
    await outputHandle.close();
    await copyFile(input, output);
    writable = new DatabaseSync(output);
    writable.exec(migrationSql);
    const migrationChanges = migrateData(writable, old);
    writable.exec('CREATE INDEX facts_by_semantic_key ON facts(entry_id, semantic_key);');
    writable.exec('PRAGMA user_version = 6;');
    writable.exec('COMMIT; PRAGMA foreign_keys = ON;');
    validateMigratedDatabase(writable);
    writable.close();
    writable = null;
    return {
      output,
      entries: old.entryCategories.size,
      facts: old.facts.length + migrationChanges.factsAdded,
      relations: old.links.length / 2,
      icons: iconSeed.length,
    };
  } catch (error) {
    try { writable?.exec('ROLLBACK; PRAGMA foreign_keys = ON;'); } catch (failure) { rollbackError = failure; }
    try { writable?.close(); } catch (failure) { rollbackError ??= failure; }
    if (outputCreated) await rm(output, { force: true });
    if (rollbackError) throw new AggregateError([error, rollbackError], '遷移失敗且 rollback 或關閉資料庫亦失敗。');
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw new Error('用法：node tools/migrate-v5-to-v6.mjs <v5.sqlite> <new-v6.sqlite>');
  const result = await migrateV5Catalog(input, output);
  console.log(`schema v5 → v6：${result.entries} 筆條目、${result.facts} 筆 facts、${result.relations} 組關聯、${result.icons} 個圖標。`);
}
