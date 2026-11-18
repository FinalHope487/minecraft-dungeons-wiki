import { lstat, mkdir, readdir, writeFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { languages } from '../src/locale.mjs';
import { deriveDetailPresentation } from '../src/detail-policy.mjs';

const databaseFile = fileURLToPath(new URL('../content/catalog.sqlite', import.meta.url));
const assetDirectory = new URL('../assets/', import.meta.url);
const supportedTones = new Set(['steel', 'gold', 'violet']);
const supportedRelationKinds = new Set(['base_variant', 'weapon_enchantment']);
const supportedGearCategories = new Set(['equipment', 'ranged', 'armor']);
const supportedIconKinds = new Set(['enchantment', 'equipment', 'artifact', 'consumable', 'built-in-property', 'placeholder', 'other']);
const isId = (value) => typeof value === 'string' && /^[a-z][a-z0-9-]*$/.test(value) && value !== 'all';
const isSemanticKey = (value) => typeof value === 'string' && /^[a-z][a-z0-9_]*$/.test(value);
const isLocalized = (value) => value && languages.every((language) => typeof value[language] === 'string' && value[language].trim());

function translationsById(rows, idKey, valueKeys) {
  const result = new Map();
  for (const row of rows) {
    if (!result.has(row[idKey])) result.set(row[idKey], {});
    const localized = result.get(row[idKey]);
    localized[row.language] = Object.fromEntries(valueKeys.map((key) => [key, row[key]]));
  }
  return result;
}

function localize(translations, id, key) {
  return Object.fromEntries(languages.map((language) => [language, translations.get(id)?.[language]?.[key]]));
}

function childRows(rows, parentKey, transform) {
  const result = new Map();
  for (const row of rows) {
    if (!result.has(row[parentKey])) result.set(row[parentKey], []);
    result.get(row[parentKey]).push(transform(row));
  }
  return result;
}

function readDatabase(database) {
  const schemaVersion = database.prepare('PRAGMA user_version').get().user_version;
  if (schemaVersion !== 6) throw new Error(`不支援的 SQLite schema 版本：${schemaVersion}（需要 6）。`);

  const integrity = database.prepare('PRAGMA integrity_check').all();
  if (integrity.length !== 1 || integrity[0].integrity_check !== 'ok') {
    throw new Error(`SQLite 完整性檢查失敗：${integrity.map((row) => row.integrity_check).join('; ')}`);
  }
  const foreignKeyErrors = database.prepare('PRAGMA foreign_key_check').all();
  if (foreignKeyErrors.length) throw new Error(`SQLite 有 ${foreignKeyErrors.length} 筆外鍵錯誤。`);

  const categories = database.prepare('SELECT id, icon, group_key, position FROM categories ORDER BY position').all();
  const categoryTexts = translationsById(
    database.prepare('SELECT category_id, language, label FROM category_translations ORDER BY category_id, language').all(),
    'category_id', ['label'],
  );
  const entries = database.prepare(`SELECT id, category_id, icon, tone, implemented, seasonal, description_status, position
    FROM entries ORDER BY position`).all();
  const entryTexts = translationsById(
    database.prepare('SELECT entry_id, language, name, badge, description FROM entry_translations ORDER BY entry_id, language').all(),
    'entry_id', ['name', 'badge', 'description'],
  );
  const factTexts = translationsById(
    database.prepare('SELECT fact_id, language, label, value FROM fact_translations ORDER BY fact_id, language').all(),
    'fact_id', ['label', 'value'],
  );
  const evidence = childRows(
    database.prepare(`SELECT fact_evidence.fact_id, fact_evidence.relation,
        entry_sources.id AS source_id, entry_sources.label, entry_sources.url
      FROM fact_evidence JOIN entry_sources ON entry_sources.id = fact_evidence.source_id
      ORDER BY entry_sources.position, fact_evidence.relation`).all(),
    'fact_id', (row) => ({ id: row.source_id, label: row.label, url: row.url, relation: row.relation }),
  );
  const facts = childRows(
    database.prepare(`SELECT id, entry_id, semantic_key, claim_origin, wiki_status, position
      FROM facts ORDER BY entry_id, position`).all(),
    'entry_id', (row) => ({
      id: row.id,
      position: row.position,
      semanticKey: row.semantic_key,
      claimOrigin: row.claim_origin,
      wikiStatus: row.wiki_status,
      label: localize(factTexts, row.id, 'label'),
      value: localize(factTexts, row.id, 'value'),
      evidence: evidence.get(row.id) ?? [],
    }),
  );
  const traitTexts = translationsById(
    database.prepare('SELECT trait_id, language, label FROM trait_translations ORDER BY trait_id, language').all(),
    'trait_id', ['label'],
  );
  const traits = childRows(
    database.prepare('SELECT id, entry_id, icon, position FROM traits ORDER BY entry_id, position').all(),
    'entry_id', (row) => ({ id: row.id, icon: row.icon, position: row.position, label: localize(traitTexts, row.id, 'label') }),
  );
  const traitIndexesById = new Map([...traits.values()].flatMap((entryTraits) =>
    entryTraits.map((trait, index) => [trait.id, index])));
  const relationTexts = new Map(database.prepare(`SELECT relation_kind, direction, language, label
    FROM relation_type_translations ORDER BY relation_kind, direction, language`).all()
    .map((row) => [`${row.relation_kind}|${row.direction}|${row.language}`, row.label]));
  const relationRows = database.prepare(`SELECT link.id, link.position, link.direction,
      relation.id AS relation_id, relation.relation_kind, relation.source_entry_id, relation.target_entry_id,
      built_in.property_icon, built_in.tier, built_in.property_trait_id
    FROM entry_links AS link
    JOIN entry_relations AS relation ON relation.id = link.relation_id
    LEFT JOIN entry_built_in_enchantments AS built_in ON built_in.link_id = link.id
    ORDER BY link.position, link.id`).all();
  const links = childRows(relationRows.map((row) => ({
    ...row,
    entry_id: row.direction === 'forward' ? row.source_entry_id : row.target_entry_id,
  })).sort((a, b) => a.entry_id.localeCompare(b.entry_id) || a.position - b.position), 'entry_id', (row) => {
    const label = Object.fromEntries(languages.map((language) => [
      language,
      relationTexts.get(`${row.relation_kind}|${row.direction}|${language}`),
    ]));
    return {
      id: row.direction === 'forward' ? row.target_entry_id : row.source_entry_id,
      linkId: row.id,
      kind: row.relation_kind,
      direction: row.direction,
      position: row.position,
      label,
      ...(row.property_icon ? { builtInEnchantment: {
        tier: row.tier,
        propertyIcon: row.property_icon,
        propertyTraitIndex: traitIndexesById.get(row.property_trait_id),
      } } : {}),
    };
  });
  const effectProfiles = new Map(database.prepare(`SELECT entry_id, player_availability, mob_availability,
      effect_relation, player_fact_id, mob_fact_id
    FROM enchantment_effect_profiles`).all().map((row) => [row.entry_id, {
    playerAvailability: row.player_availability,
    mobAvailability: row.mob_availability,
    effectRelation: row.effect_relation,
    playerFactId: row.player_fact_id,
    mobFactId: row.mob_fact_id,
  }]));
  const sources = childRows(
    database.prepare('SELECT id, entry_id, label, url, position FROM entry_sources ORDER BY entry_id, position').all(),
    'entry_id', (row) => ({ id: row.id, label: row.label, url: row.url, position: row.position }),
  );
  const iconAssets = database.prepare(`SELECT id, file, kind, source_page AS sourcePage,
      wiki_file_title AS wikiFileTitle, provenance
    FROM icon_assets ORDER BY id`).all();
  const iconRecipes = database.prepare(`SELECT id, base_role AS baseRole, overlay_role AS overlayRole,
      overlay_percent AS overlayPercent, frame_style AS frameStyle
    FROM icon_recipes ORDER BY id`).all();

  const catalog = {
    schemaVersion,
    categories: categories.map((category) => ({
      id: category.id,
      label: localize(categoryTexts, category.id, 'label'),
      icon: category.icon,
      position: category.position,
      ...(category.group_key ? { group: category.group_key } : {}),
    })),
    entries: entries.map((entry) => ({
      id: entry.id,
      category: entry.category_id,
      name: localize(entryTexts, entry.id, 'name'),
      icon: entry.icon,
      badge: localize(entryTexts, entry.id, 'badge'),
      tone: entry.tone,
      implemented: entry.implemented === 1,
      seasonal: entry.seasonal === 1,
      descriptionStatus: entry.description_status,
      description: localize(entryTexts, entry.id, 'description'),
      facts: facts.get(entry.id) ?? [],
      traits: traits.get(entry.id) ?? [],
      links: links.get(entry.id) ?? [],
      sources: sources.get(entry.id) ?? [],
      ...(effectProfiles.has(entry.id) ? { enchantmentEffectProfile: effectProfiles.get(entry.id) } : {}),
    })),
    iconAssets,
    iconRecipes,
  };
  const entriesById = new Map(catalog.entries.map((entry) => [entry.id, entry]));
  for (const entry of catalog.entries) entry.presentation = deriveDetailPresentation(entry, entriesById);
  return catalog;
}

export function loadCatalog(path = databaseFile) {
  let database;
  try {
    database = new DatabaseSync(path, { readOnly: true, enableForeignKeyConstraints: true });
    return readDatabase(database);
  } catch (error) {
    throw new Error(`讀取圖鑑資料庫失敗：${error.message}`, { cause: error });
  } finally {
    database?.close();
  }
}

export function validateCatalog(catalog, assets) {
  const { categories, entries, iconAssets, iconRecipes } = catalog;
  const categoryIds = new Set(categories.map(({ id }) => id));
  const entryIds = new Set(entries.map(({ id }) => id));
  const entriesById = new Map(entries.map((entry) => [entry.id, entry]));
  const iconById = new Map(iconAssets.map((asset) => [asset.id, asset]));
  const sourcesById = new Map(entries.flatMap((entry) => entry.sources.map((source) => [source.id, entry.id])));
  const hasIcon = (id) => {
    const asset = iconById.get(id);
    return Boolean(asset && assets.has(asset.file));
  };

  if (!categories.length || !entries.length || categoryIds.size !== categories.length || entryIds.size !== entries.length
    || iconById.size !== iconAssets.length) {
    throw new Error('圖鑑需有分類及條目，且識別碼不得重複。');
  }
  for (const category of categories) {
    if (!isId(category.id) || category.group && category.group !== 'equipment'
      || !isLocalized(category.label) || !hasIcon(category.icon)) {
      throw new Error(`無效分類或圖標：${category.id}`);
    }
  }
  for (const asset of iconAssets) {
    if (!isId(asset.id) || !asset.file || !supportedIconKinds.has(asset.kind)
      || !['wiki', 'game', 'unknown'].includes(asset.provenance)
      || !assets.has(asset.file)
      || (asset.provenance === 'wiki' && (!asset.sourcePage || !asset.wikiFileTitle))) {
      throw new Error(`圖標登錄無效：${asset.id}`);
    }
  }
  const recipe = iconRecipes.find(({ id }) => id === 'built_in_enchantment');
  if (iconRecipes.length !== 1 || !recipe || recipe.baseRole !== 'property_icon'
    || recipe.overlayRole !== 'target_entry_icon' || !Number.isInteger(recipe.overlayPercent)
    || recipe.overlayPercent < 1 || recipe.overlayPercent > 100 || !['none', 'orange'].includes(recipe.frameStyle)) {
    throw new Error('內建附魔圖標配方無效。');
  }

  for (const entry of entries) {
    if (!isId(entry.id) || !categoryIds.has(entry.category)
      || ![entry.name, entry.description, entry.badge].every(isLocalized) || !hasIcon(entry.icon)
      || !supportedTones.has(entry.tone) || typeof entry.implemented !== 'boolean'
      || typeof entry.seasonal !== 'boolean' || !['source', 'placeholder', 'unknown'].includes(entry.descriptionStatus)) {
      throw new Error(`條目缺少必要欄位或圖標：${entry.id}`);
    }
    if (!entry.facts.every((fact) => isSemanticKey(fact.semanticKey) && ['source', 'inference', 'unknown'].includes(fact.claimOrigin)
      && ['unmarked', 'verify', 'unknown'].includes(fact.wikiStatus) && isLocalized(fact.label) && isLocalized(fact.value)
      && fact.evidence.every((item) => sourcesById.get(item.id) === entry.id && ['context', 'supports', 'conflicts'].includes(item.relation)))
      || !entry.traits.every((trait) => isLocalized(trait.label) && hasIcon(trait.icon))
      || !entry.links.every((relation) => isLocalized(relation.label) && entryIds.has(relation.id)
        && supportedRelationKinds.has(relation.kind))) {
      throw new Error(`條目的固定特性、事實或關聯無效：${entry.id}`);
    }
    const unsupportedSourceFact = entry.facts.find((fact) => fact.claimOrigin === 'source'
      && !fact.evidence.some(({ relation }) => relation === 'supports'));
    if (unsupportedSourceFact) {
      throw new Error(`來源主張缺少支持證據：${entry.id} / fact ${unsupportedSourceFact.id}`);
    }
    const linkPositions = new Set();
    const builtInTraitIndexes = new Set();
    for (const relation of entry.links) {
      if (linkPositions.has(relation.position)) throw new Error(`關聯排序重複：${entry.id} @ ${relation.position}`);
      linkPositions.add(relation.position);
      const target = entriesById.get(relation.id);
      const endpointsValid = relation.kind === 'base_variant'
        ? supportedGearCategories.has(entry.category) && supportedGearCategories.has(target.category)
        : (supportedGearCategories.has(entry.category) && target.category === 'enchantments')
          || (entry.category === 'enchantments' && supportedGearCategories.has(target.category));
      if (!endpointsValid) throw new Error(`關聯端點種類錯誤：${entry.id} → ${relation.id} (${relation.kind})`);
      const weaponEnchantmentLink = ['equipment', 'ranged'].includes(entry.category) && target.category === 'enchantments';
      const metadata = relation.builtInEnchantment;
      const propertyTrait = metadata && entry.traits[metadata.propertyTraitIndex];
      if (weaponEnchantmentLink !== Boolean(metadata)
        || (metadata && (!['regular-bullet', 'unique-bullet'].includes(metadata.propertyIcon)
          || !(metadata.tier === null || Number.isInteger(metadata.tier) && metadata.tier >= 1 && metadata.tier <= 3)
          || !Number.isInteger(metadata.propertyTraitIndex) || !propertyTrait
          || propertyTrait.icon !== metadata.propertyIcon || builtInTraitIndexes.has(metadata.propertyTraitIndex)))) {
        throw new Error(`武器內建附魔標記無效：${entry.id} → ${relation.id}`);
      }
      if (metadata) builtInTraitIndexes.add(metadata.propertyTraitIndex);
    }
    if (!entry.sources.length || entry.sources.some((source) => {
      let url;
      try { url = new URL(source.url); } catch { return true; }
      return !source.label?.trim() || url.protocol !== 'https:';
    })) throw new Error(`條目需提供 HTTPS 來源：${entry.id}`);

    const profile = entry.enchantmentEffectProfile;
    if (entry.category === 'enchantments') {
      const factById = new Map(entry.facts.map((fact) => [fact.id, fact]));
      if (!profile || !['available', 'unavailable', 'unknown'].includes(profile.playerAvailability)
        || !['available', 'unavailable', 'unknown'].includes(profile.mobAvailability)
        || !['same', 'different', 'unknown'].includes(profile.effectRelation)
        || (profile.playerFactId !== null && factById.get(profile.playerFactId)?.semanticKey !== 'player_effect')
        || (profile.mobFactId !== null && factById.get(profile.mobFactId)?.semanticKey !== 'mob_effect')
        || (profile.effectRelation === 'same' && (!profile.playerFactId || !profile.mobFactId))) {
        throw new Error(`附魔效果結構無效：${entry.id}`);
      }
    } else if (profile) {
      throw new Error(`非附魔條目不可有附魔效果 profile：${entry.id}`);
    }
  }
}

export async function writeCatalogArtifacts(outputRoot, { assetsDirectory = assetDirectory, catalog = loadCatalog() } = {}) {
  const assets = new Set(await readdir(assetsDirectory));
  validateCatalog(catalog, assets);

  const rootPath = resolve(outputRoot instanceof URL ? fileURLToPath(outputRoot) : outputRoot);
  const dataPath = resolve(rootPath, 'data');
  if (!dataPath.startsWith(`${rootPath}${sep}`)) throw new Error('資料 JSON 輸出路徑超出指定目錄。');
  await ensureDirectory(dataPath);
  const detailsPath = join(dataPath, 'entries');
  await ensureDirectory(detailsPath);

  const index = {
    schemaVersion: 6,
    categories: catalog.categories,
    entries: catalog.entries.map(({ id, category, name, icon, badge, tone, implemented, seasonal }) => ({
      id, category, name, icon, badge, tone, implemented, seasonal,
    })),
    iconAssets: catalog.iconAssets,
    iconRecipes: catalog.iconRecipes,
  };
  await writeFile(join(dataPath, 'catalog-index.json'), `${JSON.stringify(index)}\n`, 'utf8');
  for (const entry of catalog.entries) {
    await writeFile(join(detailsPath, `${entry.id}.json`), `${JSON.stringify({ schemaVersion: 6, entry })}\n`, 'utf8');
  }
  return { categories: catalog.categories, entries: catalog.entries, iconAssets: catalog.iconAssets, iconRecipes: catalog.iconRecipes };
}

async function ensureDirectory(path) {
  try {
    const stats = await lstat(path);
    if (stats.isSymbolicLink() || !stats.isDirectory()) throw new Error(`輸出路徑必須是一般目錄：${path}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await mkdir(path, { recursive: true });
  }
}
