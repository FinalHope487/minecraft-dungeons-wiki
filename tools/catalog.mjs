import { lstat, mkdir, readdir, writeFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { languages } from '../src/locale.mjs';
import { iconAssets } from '../src/icon-assets.mjs';

const databaseFile = fileURLToPath(new URL('../content/catalog.sqlite', import.meta.url));
const assetDirectory = new URL('../assets/', import.meta.url);
const supportedTones = new Set(['steel', 'gold', 'violet']);
const isId = (value) => typeof value === 'string' && /^[a-z][a-z0-9-]*$/.test(value) && value !== 'all';
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
  if (schemaVersion !== 5) throw new Error(`不支援的 SQLite schema 版本：${schemaVersion}（需要 5）。`);

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
  const entries = database.prepare('SELECT id, category_id, icon, tone, implemented, seasonal, position FROM entries ORDER BY position').all();
  const entryTexts = translationsById(
    database.prepare('SELECT entry_id, language, name, badge, description FROM entry_translations ORDER BY entry_id, language').all(),
    'entry_id', ['name', 'badge', 'description'],
  );
  const factTexts = translationsById(
    database.prepare('SELECT fact_id, language, label, value FROM fact_translations ORDER BY fact_id, language').all(),
    'fact_id', ['label', 'value'],
  );
  const facts = childRows(
    database.prepare(`SELECT facts.id, facts.entry_id, facts.position
      FROM facts ORDER BY facts.entry_id, facts.position`).all(),
    'entry_id', (row) => ({ id: row.id, position: row.position }),
  );
  const traitTexts = translationsById(
    database.prepare('SELECT trait_id, language, label FROM trait_translations ORDER BY trait_id, language').all(),
    'trait_id', ['label'],
  );
  const traits = childRows(
    database.prepare('SELECT id, entry_id, icon, position FROM traits ORDER BY entry_id, position').all(),
    'entry_id', (row) => ({ id: row.id, icon: row.icon, position: row.position }),
  );
  const traitIndexesById = new Map([...traits.values()].flatMap((entryTraits) =>
    entryTraits.map((trait, index) => [trait.id, index])));
  const linkTexts = translationsById(
    database.prepare('SELECT link_id, language, label FROM entry_link_translations ORDER BY link_id, language').all(),
    'link_id', ['label'],
  );
  const links = childRows(
    database.prepare(`SELECT entry_links.id, entry_links.entry_id, entry_links.target_entry_id, entry_links.position,
        built_in.property_icon, built_in.tier, built_in.property_trait_id
      FROM entry_links LEFT JOIN entry_built_in_enchantments AS built_in ON built_in.link_id = entry_links.id
      ORDER BY entry_links.entry_id, entry_links.position`).all(),
    'entry_id', (row) => ({
      id: row.id,
      target: row.target_entry_id,
      position: row.position,
      ...(row.property_icon ? { builtInEnchantment: {
        tier: row.tier,
        propertyIcon: row.property_icon,
        propertyTraitIndex: traitIndexesById.get(row.property_trait_id),
      } } : {}),
    }),
  );
  const sources = childRows(
    database.prepare('SELECT id, entry_id, label, url, position FROM entry_sources ORDER BY entry_id, position').all(),
    'entry_id', (row) => ({ label: row.label, url: row.url, position: row.position }),
  );

  return {
    categories: categories.map((category) => ({
      id: category.id,
      label: localize(categoryTexts, category.id, 'label'),
      icon: category.icon,
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
      description: localize(entryTexts, entry.id, 'description'),
      facts: (facts.get(entry.id) ?? []).map((fact) => ({
        label: localize(factTexts, fact.id, 'label'),
        value: localize(factTexts, fact.id, 'value'),
      })),
      traits: (traits.get(entry.id) ?? []).map((trait) => ({
        icon: trait.icon,
        label: localize(traitTexts, trait.id, 'label'),
      })),
      links: (links.get(entry.id) ?? []).map((link) => ({
        id: link.target,
        label: localize(linkTexts, link.id, 'label'),
        ...(link.builtInEnchantment ? { builtInEnchantment: link.builtInEnchantment } : {}),
      })),
      sources: (sources.get(entry.id) ?? []).map(({ label, url }) => ({ label, url })),
    })),
  };
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

export function validateCatalog(categories, entries, assets) {
  const categoryIds = new Set(categories.map(({ id }) => id));
  const entryIds = new Set(entries.map(({ id }) => id));
  const entriesById = new Map(entries.map((entry) => [entry.id, entry]));
  const hasIcon = (id) => {
    const asset = iconAssets[id];
    return Boolean(asset && assets.has(asset.file));
  };

  if (!categories.length || !entries.length || categoryIds.size !== categories.length || entryIds.size !== entries.length) {
    throw new Error('圖鑑需有分類及條目，且識別碼不得重複。');
  }

  for (const category of categories) {
    if (!isId(category.id) || category.group && category.group !== 'equipment' || !isLocalized(category.label) || !hasIcon(category.icon)) {
      throw new Error(`無效分類或圖標：${category.id}`);
    }
  }

  for (const entry of entries) {
    if (!isId(entry.id) || !categoryIds.has(entry.category)
      || ![entry.name, entry.description, entry.badge].every(isLocalized) || !hasIcon(entry.icon)
      || !supportedTones.has(entry.tone) || typeof entry.implemented !== 'boolean' || typeof entry.seasonal !== 'boolean') {
      throw new Error(`條目缺少必要欄位或圖標：${entry.id}`);
    }
    if (!entry.facts.every(({ label, value }) => isLocalized(label) && isLocalized(value))
      || !entry.traits.every((trait) => isLocalized(trait.label) && hasIcon(trait.icon))
      || !entry.links.every((relation) => isLocalized(relation.label) && entryIds.has(relation.id))) {
      throw new Error(`條目的固定特性或關聯無效：${entry.id}`);
    }
    const builtInTraitIndexes = new Set();
    for (const relation of entry.links) {
      const target = entriesById.get(relation.id);
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
      try {
        url = new URL(source.url);
      } catch {
        return true;
      }
      return !source.label?.trim() || url.protocol !== 'https:';
    })) {
      throw new Error(`條目需提供 HTTPS 來源：${entry.id}`);
    }
  }
}

export async function writeCatalogArtifacts(outputRoot, { assetsDirectory = assetDirectory, catalog = loadCatalog() } = {}) {
  const { categories, entries } = catalog;
  const assets = new Set(await readdir(assetsDirectory));
  validateCatalog(categories, entries, assets);

  const rootPath = resolve(outputRoot instanceof URL ? fileURLToPath(outputRoot) : outputRoot);
  const dataPath = resolve(rootPath, 'data');
  if (!dataPath.startsWith(`${rootPath}${sep}`)) throw new Error('資料 JSON 輸出路徑超出指定目錄。');
  await ensureDirectory(dataPath);
  const detailsPath = join(dataPath, 'entries');
  await ensureDirectory(detailsPath);

  const index = {
    schemaVersion: 5,
    categories,
    entries: entries.map(({ id, category, name, icon, badge, tone, implemented, seasonal }) => ({
      id, category, name, icon, badge, tone, implemented, seasonal,
    })),
  };
  await writeFile(join(dataPath, 'catalog-index.json'), `${JSON.stringify(index)}\n`, 'utf8');
  for (const entry of entries) {
    await writeFile(join(detailsPath, `${entry.id}.json`), `${JSON.stringify({ schemaVersion: 5, entry })}\n`, 'utf8');
  }
  return { categories, entries };
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
