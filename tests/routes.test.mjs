import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog } from '../tools/catalog.mjs';
import { entryHash, listEntries, resolveRoute } from '../src/routes.mjs';
import { getInventoryEmptySlotCount, resolveInventoryColumnCount } from '../src/inventory-grid.mjs';

const { categories, entries } = loadCatalog();
const resolve = (hash) => resolveRoute(hash, categories, entries);
const meleeIds = [
  'sword', 'diamond-sword', 'anchor', 'axe', 'backstabber', 'battlestaff', 'boneclub',
  'broken-sawblade', 'claymore', 'coral-blade', 'cutlass', 'daggers', 'double-axe',
  'gauntlets', 'glaive', 'great-hammer', 'katana', 'mace', 'obsidian-claymore', 'pickaxe',
  'rapier', 'sickles', 'soul-knife', 'soul-scythe', 'spear', 'tempest-knife',
  'void-touched-blades', 'whip',
];
const regularWeaponProperties = new Map(Object.entries({
  anchor: ['Slow but powerful', 'Absorbs some knockback', 'Pulls in enemies'],
  axe: ['Spin attack move'],
  backstabber: ['Extra damage on unsuspecting enemies'],
  battlestaff: ['Stylish combo'],
  boneclub: ['Great pushback'],
  'broken-sawblade': ['Continuous attacks'],
  claymore: ['Powerful pushback'],
  'coral-blade': ['Rapid slashes'],
  cutlass: ['Reliable Combo'],
  daggers: ['Dual wield'],
  'double-axe': ['Spin attack'],
  gauntlets: ['Relentless combo'],
  glaive: ['Longer melee reach'],
  'great-hammer': ['Great splash'],
  'obsidian-claymore': ['Powerful combo'],
  rapier: ['Fast thrusts'],
  sickles: ['Dual wield'],
  'soul-knife': ['Thrust attack'],
  spear: ['Long melee reach'],
  'tempest-knife': ['Speed burst after mob defeated'],
  'void-touched-blades': ['Applies rising damage multiplier'],
  whip: ['Longer melee reach'],
}));

test('首頁在全部總覽預設選取 Sword 與背包格', () => {
  assert.equal(resolve('').category.id, 'all');
  assert.equal(resolve('').entry.id, 'sword');
  assert.equal(resolve('').layout, 'inventory');
});

test('全部裝備合併近戰、遠程、盔甲與神器，附魔獨立', () => {
  const ids = (hash) => listEntries(resolve(hash).category, categories, entries).map(({ id }) => id);
  assert.deepEqual(ids('#all'), [...meleeIds, 'bow', 'hunters-armor', 'death-cap-mushroom']);
  assert.deepEqual(ids('#equipment'), meleeIds);
  assert.deepEqual(ids('#ranged'), ['bow']);
  assert.deepEqual(ids('#armor'), ['hunters-armor']);
  assert.deepEqual(ids('#artifacts'), ['death-cap-mushroom']);
  assert.deepEqual(ids('#enchantments'), ['sharpness', 'swirling']);
  assert.equal(resolve('#all/sharpness').missing, true);
  assert.equal(resolve('#equipment/bow').missing, true);
  assert.equal(resolve('#all/hunters-armor/compact').entry.id, 'hunters-armor');
  assert.equal(resolve('#all/hunters-armor/compact').layout, 'compact');
});

test('每把近戰與遠程武器都有總表及正確的具體項目頁來源', () => {
  const weaponOverview = 'https://minecraft.wiki/w/Dungeons%3AWeapon';
  const weapons = entries.filter(({ category }) => category === 'equipment' || category === 'ranged');
  assert.equal(weapons.length, 29);
  for (const weapon of weapons) {
    const sourceUrls = weapon.sources.map(({ url }) => url);
    const specificPage = `https://minecraft.wiki/w/Dungeons%3A${weapon.name.en.replaceAll(' ', '_')}`;
    assert.equal(sourceUrls[0], weaponOverview, `${weapon.id} must list the weapon overview first`);
    assert.equal(sourceUrls[1], specificPage, `${weapon.id} must list its Minecraft Wiki article second`);
  }
});

test('Death Cap Mushroom 作為神器樣本有雙語說明、冷卻、固定效果與 Wiki 來源', () => {
  const artifact = entries.find(({ id }) => id === 'death-cap-mushroom');
  assert.ok(artifact);
  assert.equal(artifact.category, 'artifacts');
  assert.equal(artifact.name.en, 'Death Cap Mushroom');
  assert.equal(artifact.badge.en, 'Artifact');
  assert.equal(artifact.facts.find(({ label }) => label.en === 'Cooldown')?.value.en, '30 seconds');
  assert.equal(artifact.facts.find(({ label }) => label.en === 'Fixed effects')?.value.en,
    'Increases attack speed by 100%; increases movement speed by 20%.');
  assert.ok(artifact.sources.some(({ url }) => url === 'https://minecraft.wiki/w/Dungeons%3ADeath_Cap_Mushroom'));
  assert.ok(artifact.sources.some(({ url }) => url === 'https://minecraft.wiki/w/Dungeons%3AArtifact'));
});

test('近戰分類有 27 種 Common / Rare 基礎武器並保留 Diamond Sword', () => {
  const melee = listEntries(resolve('#equipment').category, categories, entries);
  assert.equal(melee.length, 28);
  assert.equal(melee.filter(({ id }) => id !== 'diamond-sword').length, 27);
  assert.deepEqual(melee.filter(({ id }) => id !== 'diamond-sword').map(({ badge, facts }) => ({
    badge: badge.en,
    type: facts.find(({ label }) => label.en === 'Type')?.value.en,
  })), Array.from({ length: 27 }, () => ({ badge: 'Common / Rare', type: 'Melee weapon' })));
  assert.equal(melee.find(({ id }) => id === 'diamond-sword')?.badge.en, 'Unique');
});

test('近戰武器的 Regular Bullet 固有效果與 Wiki 總表一致', () => {
  const baseMelee = entries.filter(({ id }) => meleeIds.includes(id) && id !== 'diamond-sword');
  assert.equal(baseMelee.length, 27);
  assert.equal(regularWeaponProperties.size, 22);
  for (const entry of baseMelee) {
    assert.deepEqual(entry.traits.map(({ icon, label }) => ({ icon, label: label.en })),
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

test('只有 Diamond Sword 帶有 Extra damage 特性', () => {
  const withExtraDamage = entries.filter(({ traits }) => traits.some(({ label }) => label.en === 'Extra damage'));
  assert.deepEqual(withExtraDamage.map(({ id }) => id), ['diamond-sword']);
  assert.equal(withExtraDamage[0].traits[0].icon, 'unique-bullet');
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
