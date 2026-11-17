import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadCatalog } from '../tools/catalog.mjs';
import { iconAssets } from '../src/icon-assets.mjs';
import { entryHash, listEntries, resolveRoute } from '../src/routes.mjs';
import { getInventoryEmptySlotCount, resolveInventoryColumnCount } from '../src/inventory-grid.mjs';

const { categories, entries } = loadCatalog();
const roster = JSON.parse(readFileSync(new URL('./fixtures/wiki-item-roster.json', import.meta.url), 'utf8'));
const enchantmentRoster = JSON.parse(readFileSync(new URL('./fixtures/wiki-enchantment-roster.json', import.meta.url), 'utf8'));
const gearRoster = JSON.parse(readFileSync(new URL('./fixtures/wiki-gear-roster.json', import.meta.url), 'utf8'));
const builtInMarkerRoster = JSON.parse(readFileSync(new URL('./fixtures/wiki-built-in-enchantment-markers.json', import.meta.url), 'utf8'));
const wikiArtifactDescriptions = JSON.parse(readFileSync(new URL('./fixtures/wiki-artifact-descriptions.json', import.meta.url), 'utf8'));
const wikiItemDescriptions = JSON.parse(readFileSync(new URL('./fixtures/wiki-item-descriptions.json', import.meta.url), 'utf8'));
const resolve = (hash) => resolveRoute(hash, categories, entries);
const meleeIds = [
  'anchor', 'axe', 'backstabber', 'battlestaff', 'boneclub',
  'broken-sawblade', 'claymore', 'coral-blade', 'cutlass', 'daggers', 'double-axe',
  'gauntlets', 'glaive', 'great-hammer', 'katana', 'mace', 'obsidian-claymore', 'pickaxe',
  'rapier', 'sickles', 'soul-knife', 'soul-scythe', 'spear', 'sword', 'diamond-sword', 'tempest-knife',
  'void-touched-blades', 'whip',
];
const wikiGearRootOrder = {
  melee: [
    'anchor', 'axe', 'backstabber', 'battlestaff', 'boneclub', 'broken-sawblade', 'claymore',
    'coral-blade', 'cutlass', 'daggers', 'double-axe', 'gauntlets', 'glaive', 'great-hammer',
    'katana', 'mace', 'obsidian-claymore', 'pickaxe', 'rapier', 'sickles', 'soul-knife',
    'soul-scythe', 'spear', 'sword', 'tempest-knife', 'void-touched-blades', 'whip',
  ],
  ranged: [
    'bow', 'bubble-bow', 'burst-crossbow', 'cog-crossbow', 'crossbow', 'dual-crossbows',
    'exploding-crossbow', 'harpoon-crossbow', 'heavy-crossbow', 'hunting-bow', 'longbow',
    'power-bow', 'rapid-crossbow', 'scatter-crossbow', 'shadow-crossbow', 'shortbow', 'snow-bow',
    'soul-bow', 'soul-crossbow', 'spider-crossbow', 'trickbow', 'twisting-vine-bow', 'void-bow',
    'wind-bow',
  ],
  armor: [
    'battle-robe', 'beenest-armor', 'champions-armor', 'climbing-gear', 'dark-armor', 'emerald-gear',
    'entertainers-garb', 'evocation-robe', 'ghostly-armor', 'grim-armor', 'guards-armor',
    'hunters-armor', 'mercenary-armor', 'mystery-armor', 'ocelot-armor', 'phantom-armor',
    'piglin-armor', 'plate-armor', 'reinforced-mail', 'root-rot-armor', 'scale-mail',
    'shulker-armor', 'snow-armor', 'soul-mage-robes', 'soul-robe', 'spelunker-armor',
    'sprout-armor', 'squid-armor', 'teleportation-robes', 'thief-armor', 'turtle-armor', 'wolf-armor',
  ],
};
const orderedGearEntries = (group) => gearRoster.entries
  .filter(({ rosterGroup }) => rosterGroup === group)
  .sort((a, b) => a.order - b.order);
const orderedGearRosterEntries = ['melee', 'ranged', 'armor'].flatMap(orderedGearEntries);
const regularWeaponProperties = new Map(Object.entries({
  anchor: ['Slow but powerful', 'Absorbs some knockback', 'Pulls in enemies'],
  axe: ['Spin attack move'],
  backstabber: ['Extra damage on unsuspecting enemies'],
  battlestaff: ['Stylish combo'],
  boneclub: ['Great pushback'],
  'broken-sawblade': ['Continuous attacks'],
  claymore: ['Powerful pushback'],
  'coral-blade': ['Rapid slashes'],
  cutlass: ['Reliable combo'],
  daggers: ['Dual wield'],
  'double-axe': ['Spin attack'],
  gauntlets: ['Relentless combo'],
  glaive: ['Longer melee reach'],
  'great-hammer': ['Great splash'],
  'obsidian-claymore': ['Very powerful combo'],
  rapier: ['Fast thrusts'],
  sickles: ['Dual wield'],
  'soul-knife': ['Thrust attack'],
  spear: ['Long melee reach'],
  'tempest-knife': ['Speed burst after mob defeated'],
  'void-touched-blades': ['Applies rising damage multiplier'],
  whip: ['Longer melee reach'],
}));
const rosterRows = (statuses) => Object.entries(statuses).flatMap(([status, items]) =>
  items.map(([id, , name]) => ({ id, name, implemented: status === 'implemented' })));
const artifactRoster = rosterRows(roster.artifacts);
const consumableRoster = Object.values(roster.consumables).flatMap(rosterRows);
const otherItemRoster = rosterRows(roster['other-items']);
const gearMeleeIds = orderedGearEntries('melee').map(({ id }) => id);
const gearRangedIds = orderedGearEntries('ranged').map(({ id }) => id);
const gearArmorIds = orderedGearEntries('armor').map(({ id }) => id);
const fullItemRoster = [
  ...artifactRoster.map((item) => ({ ...item, category: 'artifacts' })),
  ...consumableRoster.map((item) => ({ ...item, category: 'consumables' })),
  ...otherItemRoster.map((item) => ({ ...item, category: 'other-items' })),
];
const wikiPlaceholderIds = [
  'blightbearer', 'burning-oil-vial', 'callers-bane', 'enchantment-scroll', 'ender-pearl',
  'fire-scroll', 'flint-and-steel', 'harming-potion', 'invisibility-potion', 'key',
  'necromancers-staff', 'night-vision-potion', 'plentiful-quiver', 'rabbits-foot',
  'recycler-quiver', 'regeneration-rock', 'sanctuary-grail', 'scroll-of-heroism',
  'splash-harming-potion', 'splash-slowing-potion', 'totem-of-resistance',
  'the-monkey-motivator', 'spider-crossbow', 'soul-mage-robes',
];

test('首頁在全部總覽預設選取 Sword 與背包格', () => {
  assert.equal(resolve('').category.id, 'all');
  assert.equal(resolve('').entry.id, 'sword');
  assert.equal(resolve('').layout, 'inventory');
});

test('全部裝備包含所有神器，消耗品子類排序且其他物品維持獨立分類', () => {
  const ids = (hash) => listEntries(resolve(hash).category, categories, entries).map(({ id }) => id);
  const artifactIds = artifactRoster.map(({ id }) => id);
  const consumableIds = consumableRoster.map(({ id }) => id);
  const otherItemIds = otherItemRoster.map(({ id }) => id);
  assert.deepEqual(ids('#all'), [...gearMeleeIds, ...gearRangedIds, ...gearArmorIds, ...artifactIds]);
  assert.deepEqual(ids('#equipment'), gearMeleeIds);
  assert.deepEqual(ids('#ranged'), gearRangedIds);
  assert.deepEqual(ids('#armor'), gearArmorIds);
  assert.deepEqual(ids('#artifacts'), artifactIds);
  assert.deepEqual(ids('#consumables'), consumableIds);
  assert.deepEqual(ids('#other-items'), otherItemIds);
  assert.deepEqual(listEntries(resolve('#consumables').category, categories, entries).map((entry) =>
    entry.facts.find(({ label }) => label.en === 'Type')?.value.en), [
    ...Array.from({ length: 10 }, () => 'Food'),
    ...Array.from({ length: 15 }, () => 'Potion'),
    ...Array.from({ length: 4 }, () => 'Ammo'),
  ]);
  assert.deepEqual(ids('#enchantments'), enchantmentRoster.entries.map(({ id }) => id));
  assert.equal(resolve('#all/apple').missing, true);
  assert.equal(resolve('#all/tnt').missing, true);
  assert.equal(resolve('#all/mystery-banner').missing, true);
  assert.equal(resolve('#all/sharpness').missing, true);
  assert.equal(resolve('#equipment/bow').missing, true);
  assert.equal(resolve('#all/hunters-armor/compact').entry.id, 'hunters-armor');
  assert.equal(resolve('#all/hunters-armor/compact').layout, 'compact');
});

test('完整附魔名錄有唯一條目、雙語 Wiki 描述、分類與來源', () => {
  const actual = entries.filter(({ category }) => category === 'enchantments');
  assert.equal(enchantmentRoster.entries.length, 124);
  assert.equal(new Set(enchantmentRoster.entries.map(({ id }) => id)).size, 124);
  assert.equal(actual.length, 124);
  for (const expected of enchantmentRoster.entries) {
    const entry = actual.find(({ id }) => id === expected.id);
    assert.ok(entry, `missing enchantment ${expected.name.en}`);
    assert.deepEqual(entry.name, expected.name, `${expected.id} name`);
    assert.deepEqual(entry.badge, expected.badge, `${expected.id} rarity label`);
    assert.equal(entry.icon, expected.icon, `${expected.id} icon`);
    assert.equal(entry.implemented, expected.implemented, `${expected.id} implementation`);
    assert.equal(entry.seasonal, expected.seasonal, `${expected.id} seasonal flag`);
    assert.deepEqual(entry.description, expected.description, `${expected.id} Wiki description`);
    assert.deepEqual(entry.facts, expected.facts, `${expected.id} applicability and classification`);
    assert.deepEqual(entry.sources, expected.sources, `${expected.id} source pages`);
    assert.equal(entry.tone, 'violet', `${expected.id} enchantment tone`);
    assert.ok(iconAssets[entry.icon]?.kind === 'enchantment', `${expected.id} icon registration`);
    assert.equal(entry.sources[0].url, enchantmentRoster.source, `${expected.id} overview source`);
    assert.equal(entry.sources[1].url,
      `https://minecraft.wiki/w/Dungeons%3A${encodeURIComponent(expected.pageTitle.replaceAll(' ', '_'))}`,
      `${expected.id} specific-page source`);
  }
  assert.deepEqual(actual.filter(({ implemented }) => !implemented).map(({ id }) => id), [
    'knockback', 'bows-boon', 'barrier', 'dolphins-grace', 'shielding', 'synergy',
  ]);
  assert.deepEqual(actual.filter(({ seasonal }) => seasonal).map(({ id }) => id), ['invisible']);
  assert.equal(actual.find(({ id }) => id === 'withering')?.implemented, true,
    'Withering remains implemented because mobs use it');
  assert.deepEqual(actual.find(({ id }) => id === 'radiance')?.facts.find(({ label }) => label.en === 'Ranged name'), {
    label: { en: 'Ranged name', 'zh-Hant': '遠程名稱' },
    value: { en: 'Radiance Shot', 'zh-Hant': '遠程武器稱為 Radiance Shot' },
  });
});

test('124 筆附魔逐項區分玩家與怪物用途並保留可信度與查證來源', () => {
  const actual = entries.filter(({ category }) => category === 'enchantments');
  const audienceValues = new Set(['player', 'mob', 'both', 'unused', 'unconfirmed']);
  const confidenceValues = new Set(['high', 'medium', 'low']);
  assert.equal(enchantmentRoster.entries.length, 124);
  for (const expected of enchantmentRoster.entries) {
    assert.ok(expected.availability, `${expected.id} availability audit`);
    assert.ok(audienceValues.has(expected.availability.audience), `${expected.id} audience`);
    assert.ok(confidenceValues.has(expected.availability.confidence), `${expected.id} confidence`);
    assert.ok(expected.availability.hero, `${expected.id} hero usage`);
    assert.ok(expected.availability.mobs, `${expected.id} mob usage`);
    assert.ok(expected.availability.playerEffect, `${expected.id} player effect`);
    assert.ok(expected.availability.mobEffect, `${expected.id} mob effect`);
    const entry = actual.find(({ id }) => id === expected.id);
    const factValue = (label) => entry.facts.find((fact) => fact.label.en === label)?.value;
    const localizedValue = ([en, zhHant]) => ({ en, 'zh-Hant': zhHant });
    assert.deepEqual(factValue('Hero availability'), localizedValue(expected.availability.hero), `${expected.id} hero detail`);
    assert.deepEqual(factValue('Player effect'), localizedValue(expected.availability.playerEffect), `${expected.id} player effect detail`);
    assert.deepEqual(factValue('Mob availability'), localizedValue(expected.availability.mobs), `${expected.id} mob availability detail`);
    assert.deepEqual(factValue('Mob effect'), localizedValue(expected.availability.mobEffect), `${expected.id} mob effect detail`);
    assert.equal(factValue('Audience').en, {
      player: 'Player only', mob: 'Mob only', both: 'Player and mob',
      unused: 'Unused; neither is available', unconfirmed: 'Unconfirmed',
    }[expected.availability.audience], `${expected.id} audience detail`);
    assert.equal(factValue('Evidence confidence').en.startsWith(expected.availability.confidence[0].toUpperCase()), true,
      `${expected.id} confidence detail`);
    assert.ok(entry.sources.some(({ url }) => url === 'https://minecraft.wiki/w/Dungeons%3AEnchanted'),
      `${expected.id} enchanted-mob source`);
    for (const url of expected.availability.evidenceSources) {
      assert.ok(entry.sources.some((source) => source.url === url), `${expected.id} evidence source ${url}`);
    }
  }

  const byId = new Map(actual.map((entry) => [entry.id, entry]));
  const value = (id, label) => byId.get(id).facts.find((fact) => fact.label.en === label).value.en;
  assert.match(value('critical-hit', 'Player effect'), /10% \/ 15% \/ 20%/);
  assert.match(value('critical-hit', 'Mob effect'), /always deal triple/);
  assert.match(value('thorns', 'Player effect'), /100% \/ 150% \/ 200%/);
  assert.match(value('thorns', 'Mob effect'), /12\.5%/);
  assert.match(value('protection', 'Player effect'), /6% \/ 11% \/ 15%/);
  assert.match(value('protection', 'Mob effect'), /50% less damage/);
  assert.match(value('thundering', 'Player effect'), /30% chance/);
  assert.match(value('thundering', 'Mob effect'), /after each mob attack/);
  assert.match(value('echo', 'Player effect'), /5 \/ 4 \/ 3-second cooldowns/);
  assert.match(value('echo', 'Mob effect'), /immediately/);
  assert.match(value('radiance', 'Player effect'), /20% chance.*50% chance/);
  assert.match(value('radiance', 'Mob effect'), /when attacking/);
  assert.match(value('gravity-pulse', 'Player effect'), /every three seconds/);
  assert.match(value('gravity-pulse', 'Mob effect'), /every ten seconds/);
  assert.equal(byId.get('committed').facts.find((fact) => fact.label.en === 'Evidence confidence').value.en.startsWith('Low'), true,
    'Committed conflict between the mob overview and item article remains explicitly low confidence');
  assert.equal(byId.get('electrified').facts.find((fact) => fact.label.en === 'Evidence confidence').value.en.startsWith('Low'), true,
    'Electrified interval conflict remains explicitly low confidence');
});

test('完整裝備名錄逐項符合 Wiki fixture 的名稱、說明、狀態、特性、來源與圖標', () => {
  const gearCategories = ['equipment', 'ranged', 'armor'];
  const actual = entries.filter(({ category }) => gearCategories.includes(category));
  assert.equal(gearRoster.entries.length, 228);
  assert.equal(new Set(gearRoster.entries.map(({ id }) => id)).size, 228);
  assert.equal(actual.length, 228);
  assert.deepEqual(gearRoster.counts, {
    total: 228, melee: 83, ranged: 72, armor: 73, seasonal: 21, unimplemented: 4, placeholders: 3, builtInLinks: 141,
  });
  assert.deepEqual(actual.map(({ id }) => id), orderedGearRosterEntries.map(({ id }) => id), 'gear entries keep Wiki base and variant order');

  const variantsByParent = new Map();
  for (const item of gearRoster.entries) {
    if (!item.parentId) continue;
    if (!variantsByParent.has(item.parentId)) variantsByParent.set(item.parentId, []);
    variantsByParent.get(item.parentId).push(item);
  }
  const gearById = new Map(actual.map((item) => [item.id, item]));
  const enchantmentsById = new Map(entries.filter(({ category }) => category === 'enchantments').map((item) => [item.id, item]));
  for (const expected of gearRoster.entries) {
    const entry = gearById.get(expected.id);
    assert.ok(entry, `missing gear ${expected.name.en}`);
    assert.equal(entry.category, expected.category, `${expected.id} category`);
    assert.deepEqual(entry.name, expected.name, `${expected.id} name`);
    assert.deepEqual(entry.badge, expected.badge, `${expected.id} rarity`);
    assert.equal(entry.tone, expected.tone, `${expected.id} rarity tone`);
    assert.equal(entry.icon, expected.icon, `${expected.id} icon`);
    assert.equal(entry.implemented, expected.implemented, `${expected.id} implementation label`);
    assert.equal(entry.seasonal, expected.seasonal, `${expected.id} Seasonal label`);
    assert.deepEqual(entry.description, expected.description, `${expected.id} in-game description`);
    assert.deepEqual(entry.facts, [{ label: { en: 'Type', 'zh-Hant': '類型' }, value: expected.type }], `${expected.id} type`);
    assert.deepEqual(entry.traits, expected.traits.map(({ icon, en, 'zh-Hant': zhHant }) => ({ icon, label: { en, 'zh-Hant': zhHant } })), `${expected.id} fixed properties`);
    assert.deepEqual(entry.sources, expected.sources, `${expected.id} Wiki source revisions`);
    assert.ok(iconAssets[entry.icon], `${expected.id} registered icon`);
    if (entry.icon !== 'wiki-placeholder') assert.equal(iconAssets[entry.icon].kind, 'equipment', `${expected.id} equipment icon kind`);

    const expectedLinks = expected.builtInEnchantments.map(({ id }) => {
      const key = `${expected.id}:${id}`;
      const tier = builtInMarkerRoster.unranked.includes(key)
        ? null
        : builtInMarkerRoster.tierOverrides[key] ?? 1;
      const propertyIcon = builtInMarkerRoster.regularBullet.includes(key) ? 'regular-bullet' : 'unique-bullet';
      const propertyTraitIndex = builtInMarkerRoster.propertyTraitPositions[key]
        ?? expected.traits.findIndex((trait) => trait.icon === propertyIcon);
      return {
        id,
        label: { en: 'Related enchantment', 'zh-Hant': '相關附魔' },
        ...(expected.rosterGroup === 'armor' ? {} : { builtInEnchantment: { tier, propertyIcon, propertyTraitIndex } }),
      };
    });
    if (expected.parentId) expectedLinks.push({ id: expected.parentId, label: { en: 'Base item', 'zh-Hant': '基礎裝備' } });
    for (const variant of variantsByParent.get(expected.id) ?? []) {
      expectedLinks.push({ id: variant.id, label: { en: 'Unique variant', 'zh-Hant': '獨特變體' } });
    }
    assert.deepEqual(entry.links, expectedLinks, `${expected.id} gear relations`);
    for (const enchantment of expected.builtInEnchantments) {
      const reverse = enchantmentsById.get(enchantment.id)?.links.find(({ id }) => id === expected.id);
      assert.deepEqual(reverse, { id: expected.id, label: { en: 'Gear with this built-in effect', 'zh-Hant': '具有此固有效果的裝備' } }, `${enchantment.id} reverse built-in relation`);
    }
  }
  const weaponBuiltIns = actual.filter(({ category }) => ['equipment', 'ranged'].includes(category))
    .flatMap((entry) => entry.links.filter(({ builtInEnchantment }) => builtInEnchantment)
      .map(({ id, builtInEnchantment }) => ({ entry: entry.id, id, ...builtInEnchantment })));
  assert.equal(weaponBuiltIns.length, 117);
  assert.equal(weaponBuiltIns.filter(({ propertyIcon }) => propertyIcon === 'regular-bullet').length, 20);
  assert.equal(weaponBuiltIns.filter(({ propertyIcon }) => propertyIcon === 'unique-bullet').length, 97);
  assert.equal(weaponBuiltIns.filter(({ tier }) => tier === 1).length, 105);
  assert.deepEqual(weaponBuiltIns.filter(({ tier }) => tier === 2).map(({ entry, id }) => `${entry}:${id}`), ['guardian-bow:supercharge']);
  assert.deepEqual(weaponBuiltIns.filter(({ tier }) => tier === 3).map(({ entry, id }) => `${entry}:${id}`), ['nautical-crossbow:piercing']);
  assert.deepEqual(weaponBuiltIns.filter(({ tier }) => tier === null).map(({ entry, id }) => `${entry}:${id}`).sort(),
    [...builtInMarkerRoster.unranked].sort());
  assert.equal(gearById.get('call-of-the-void').traits.find(({ label }) => label.en === 'Applies rising damage multiplier')?.icon,
    'regular-bullet', 'the weapon overview is the source of truth for Call of the Void properties');
  assert.deepEqual(actual.filter(({ implemented }) => !implemented).map(({ id }) => id),
    ['the-monkey-motivator', 'spider-crossbow', 'ender-armor', 'soul-mage-robes']);
  assert.deepEqual(actual.filter(({ seasonal }) => seasonal).map(({ id }) => id), orderedGearRosterEntries.filter(({ seasonal }) => seasonal).map(({ id }) => id));
});

test('近戰、遠程與盔甲的基礎物品依 Wiki 分類順序排列', () => {
  for (const [group, expected] of Object.entries(wikiGearRootOrder)) {
    const actual = gearRoster.entries
      .filter((item) => item.rosterGroup === group && !item.parentId)
      .sort((a, b) => a.order - b.order)
      .map(({ id }) => id);
    assert.deepEqual(actual, expected, `${group} base-item order`);
  }
});

test('所有 Wiki 具名神器、消耗品與其他物品都有唯一條目及正確實裝狀態', () => {
  assert.equal(fullItemRoster.length, 94);
  assert.equal(new Set(fullItemRoster.map(({ id }) => id)).size, fullItemRoster.length);
  const scopedEntries = entries.filter(({ category }) => ['artifacts', 'consumables', 'other-items'].includes(category));
  assert.equal(scopedEntries.length, fullItemRoster.length);
  for (const expected of fullItemRoster) {
    const matches = scopedEntries.filter(({ id }) => id === expected.id);
    assert.equal(matches.length, 1, `expected exactly one entry for ${expected.name}`);
    assert.equal(matches[0].category, expected.category, expected.name);
    assert.equal(matches[0].implemented, expected.implemented, expected.name);
  }
  for (const item of scopedEntries) {
    if (item.icon !== 'wiki-placeholder') {
      const expectedKind = item.category === 'artifacts' ? 'artifact' : 'consumable';
      assert.equal(iconAssets[item.icon]?.kind, expectedKind, `${item.id} icon kind`);
    }
  }
  const unimplemented = scopedEntries.filter(({ implemented }) => !implemented);
  assert.equal(unimplemented.length, 25);
  assert.equal(entries.find(({ id }) => id === 'corrupted-pumpkin')?.implemented, true,
    'seasonal but implemented artifacts remain implemented');
  for (const item of scopedEntries) assert.equal(typeof item.seasonal, 'boolean', `${item.id} seasonal flag`);
  for (const id of wikiPlaceholderIds) {
    assert.equal(entries.find((entry) => entry.id === id)?.icon, 'wiki-placeholder', `${id} uses the Wiki placeholder`);
  }
  assert.equal(iconAssets['wiki-placeholder']?.file, 'wiki-placeholder.png');
});

test('神器、消耗品與其他物品的說明逐條符合 Wiki 條目或已知資訊', () => {
  assert.equal(wikiItemDescriptions.items.length, 47);
  const scopedEntries = entries.filter(({ category }) => ['artifacts', 'consumables', 'other-items'].includes(category));
  const byId = new Map(scopedEntries.map((entry) => [entry.id, entry]));
  for (const expected of wikiItemDescriptions.items) {
    const entry = byId.get(expected.id);
    assert.ok(entry, `missing item ${expected.id}`);
    assert.deepEqual(entry.description, expected.description, `${expected.id} description`);
    assert.ok(entry.sources.some(({ url }) => url === expected.source), `${expected.id} description source`);
    assert.ok(['in-game-description', 'wiki-behavior', 'wiki-note'].includes(expected.basis), `${expected.id} source basis`);
  }
  const formerPlaceholders = new Set([
    'The Wiki lists this artifact as unused; it is not implemented in the game.',
    'A food consumable that gives the hero regeneration; some foods provide an additional positive effect.',
    'The Wiki lists this food as unused; it is not implemented in the game.',
    'A potion consumable that provides its corresponding status effect.',
    'The Wiki lists this potion as unused; it is not implemented in the game.',
    'An ammunition item that is used and depleted during a mission.',
    'A consumable used by a mission mechanic.',
    'The Wiki lists this consumable as unused; it is not implemented in the game.',
  ]);
  for (const entry of scopedEntries) {
    assert.equal(formerPlaceholders.has(entry.description.en), false, `${entry.id} no longer uses a generic placeholder`);
  }
});

test('TNT 和 Mystery Banner 保留雙語說明與 Wiki 來源', () => {
  const tnt = entries.find(({ id }) => id === 'tnt');
  const banner = entries.find(({ id }) => id === 'mystery-banner');
  assert.equal(tnt?.category, 'consumables');
  assert.equal(tnt?.implemented, true);
  assert.equal(tnt?.name.en, 'TNT');
  assert.equal(tnt?.description.en, 'Explodes when thrown, damaging everyone in a circular area.');
  assert.equal(tnt?.facts.find(({ label }) => label.en === 'Type')?.value.en, 'Ammo');
  assert.ok(tnt?.sources.some(({ url }) => url === 'https://minecraft.wiki/w/Dungeons%3ATNT'));
  assert.equal(banner?.category, 'other-items');
  assert.equal(banner?.implemented, true);
  assert.equal(banner?.name.en, 'Mystery Banner');
  assert.equal(banner?.description.en, 'Collecting a Mystery Banner instantly adds a random modifier to the mission!');
  assert.equal(banner?.facts.find(({ label }) => label.en === 'Type')?.value.en, 'Consumable');
  assert.ok(banner?.sources.some(({ url }) => url === 'https://minecraft.wiki/w/Dungeons%3AMystery_Banner'));
});

test('近戰、遠程與盔甲完整收錄並依 Wiki 基礎類型及變體相鄰排序', () => {
  assert.equal(gearMeleeIds.length, 83);
  assert.equal(gearRangedIds.length, 72);
  assert.equal(gearArmorIds.length, 73);
  const melee = orderedGearEntries('melee');
  assert.equal(melee.filter(({ parentId }) => !parentId).length, 27);
  assert.equal(melee.filter(({ parentId }) => parentId).length, 56);
  const variantsByParent = new Map();
  for (const item of gearRoster.entries.filter(({ parentId }) => parentId)) {
    if (!variantsByParent.has(item.parentId)) variantsByParent.set(item.parentId, []);
    variantsByParent.get(item.parentId).push(item);
  }
  for (const [parentId, variants] of variantsByParent) {
    const parentIndex = gearRoster.entries.findIndex(({ id }) => id === parentId);
    variants.forEach((variant, offset) => {
      const itemIndex = gearRoster.entries.findIndex(({ id }) => id === variant.id);
      assert.equal(itemIndex, parentIndex + offset + 1, `${variant.id} is adjacent to base item ${parentId}`);
    });
  }
  for (const expected of gearRoster.entries) {
    const entry = entries.find(({ id }) => id === expected.id);
    const categoryPage = expected.rosterGroup === 'armor' ? 'Dungeons:Armor' : 'Dungeons:Weapon';
    assert.equal(entry.sources[0].url, expected.sources[0].url, `${entry.id} overall source`);
    assert.equal(entry.sources[1].url, expected.sources[1].url, `${entry.id} category source`);
    assert.equal(entry.sources[2].label, expected.englishPage.title, `${entry.id} item page`);
    assert.match(entry.sources[1].url, new RegExp(`oldid=${categoryPage.endsWith('Armor') ? '3873342' : '3873343'}$`));
    assert.match(entry.sources[2].url, /oldid=\d+$/);
  }
});

test('Death Cap Mushroom 作為神器樣本有雙語說明、冷卻、固定效果與 Wiki 來源', () => {
  const artifact = entries.find(({ id }) => id === 'death-cap-mushroom');
  assert.ok(artifact);
  assert.equal(artifact.category, 'artifacts');
  assert.equal(artifact.name.en, 'Death Cap Mushroom');
  assert.equal(artifact.implemented, true);
  assert.equal(artifact.badge.en, 'Artifact');
  assert.equal(artifact.facts.find(({ label }) => label.en === 'Cooldown')?.value.en, '30 seconds');
  assert.equal(artifact.facts.find(({ label }) => label.en === 'Fixed effects')?.value.en,
    'Increases attack speed by 100%; increases movement speed by 20%.');
  assert.ok(artifact.sources.some(({ url }) => url === 'https://minecraft.wiki/w/Dungeons%3ADeath_Cap_Mushroom'));
  assert.ok(artifact.sources.some(({ url }) => url === 'https://minecraft.wiki/w/Dungeons%3AArtifact'));
});

test('既有 Seasonal 神器有標籤，已實裝神器使用 Wiki 條目原文', () => {
  assert.equal(entries.find(({ id }) => id === 'corrupted-pumpkin')?.seasonal, true);
  const expectedSeasonal = [
    ...gearRoster.entries.filter(({ seasonal }) => seasonal).map(({ id }) => id),
    'corrupted-pumpkin', 'invisible',
  ].sort();
  assert.deepEqual(entries.filter(({ seasonal }) => seasonal).map(({ id }) => id).sort(), expectedSeasonal);
  const implementedArtifacts = entries.filter(({ category, implemented }) => category === 'artifacts' && implemented);
  assert.equal(implementedArtifacts.length, Object.keys(wikiArtifactDescriptions).length);
  for (const artifact of implementedArtifacts) {
    assert.equal(artifact.description.en, wikiArtifactDescriptions[artifact.id].en, `${artifact.id} English`);
    assert.equal(artifact.description['zh-Hant'], wikiArtifactDescriptions[artifact.id]['zh-Hant'], `${artifact.id} Chinese`);
    const wikiPage = `https://minecraft.wiki/w/Dungeons%3A${artifact.name.en.replaceAll(' ', '_')}`;
    assert.ok(artifact.sources.some(({ url }) => url === wikiPage), `${artifact.id} item-page source`);
  }
});

test('近戰分類收錄 83 筆並保留 27 個基礎類型與 56 個變體', () => {
  const melee = listEntries(resolve('#equipment').category, categories, entries);
  const meleeRoster = orderedGearEntries('melee');
  assert.equal(melee.length, 83);
  assert.equal(meleeRoster.filter(({ parentId }) => !parentId).length, 27);
  assert.equal(meleeRoster.filter(({ parentId }) => parentId).length, 56);
  assert.deepEqual(melee.map(({ id }) => id), meleeRoster.map(({ id }) => id));
  assert.equal(melee.find(({ id }) => id === 'diamond-sword')?.badge.en, 'Unique');
});

test('近戰武器的 Regular Bullet 固有效果與 Wiki 總表一致', () => {
  const baseMelee = entries.filter(({ id }) => meleeIds.includes(id) && id !== 'diamond-sword');
  assert.equal(baseMelee.length, 27);
  assert.equal(regularWeaponProperties.size, 22);
  for (const entry of baseMelee) {
    assert.deepEqual(entry.traits.filter(({ icon }) => icon === 'regular-bullet').map(({ icon, label }) => ({ icon, label: label.en })),
      (regularWeaponProperties.get(entry.id) ?? []).map((label) => ({ icon: 'regular-bullet', label })),
      entry.id);
  }
});

test('每個條目可在兩種版型中從網址還原', () => {
  for (const entry of entries) {
    for (const layout of ['compact', 'inventory']) {
      const restored = resolve(entryHash(entry, layout));
      assert.equal(restored.entry, entry);
      assert.equal(restored.layout, layout);
    }
  }
});

test('錯誤分類、條目與多餘路徑會顯示找不到', () => {
  for (const hash of ['#unknown', '#equipment/unknown', '#enchantments/sword/compact', '#equipment/sword/compact/extra']) {
    assert.equal(resolve(hash).missing, true);
  }
});

test('Wiki 標示 Extra damage 的武器使用 Unique 特性標記', () => {
  const withExtraDamage = entries.filter(({ traits }) => traits.some(({ label }) => label.en === 'Extra damage'));
  assert.deepEqual(withExtraDamage.map(({ id }) => id).sort(), ['broadsword', 'diamond-sword', 'frost-slayer']);
  for (const entry of withExtraDamage) {
    assert.ok(entry.traits.some(({ icon, label }) => icon === 'unique-bullet' && label.en === 'Extra damage'), entry.id);
  }
});

test('背包每列格數只接受 2 到 6，預設 3 格', () => {
  for (const count of [2, 3, 4, 5, 6]) assert.equal(resolveInventoryColumnCount(String(count)), count);
  for (const value of [null, '', '1', '7', '2.5', 'invalid']) {
    assert.equal(resolveInventoryColumnCount(value), 3);
  }
});

test('背包空格補齊到至少四列並對齊最後一列', () => {
  assert.equal(getInventoryEmptySlotCount(4, 2), 4);
  assert.equal(getInventoryEmptySlotCount(4, 3), 8);
  assert.equal(getInventoryEmptySlotCount(6, 4), 10);
  assert.equal(getInventoryEmptySlotCount(17, 4), 3);
  assert.equal(getInventoryEmptySlotCount(0, 6), 24);
});
