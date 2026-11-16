export const iconAssets = Object.freeze({
  anchor: Object.freeze({ file: 'anchor.png', kind: 'equipment' }),
  axe: Object.freeze({ file: 'axe.png', kind: 'equipment' }),
  backstabber: Object.freeze({ file: 'backstabber.png', kind: 'equipment' }),
  battlestaff: Object.freeze({ file: 'battlestaff.png', kind: 'equipment' }),
  boneclub: Object.freeze({ file: 'boneclub.png', kind: 'equipment' }),
  'broken-sawblade': Object.freeze({ file: 'broken-sawblade.png', kind: 'equipment' }),
  bow: Object.freeze({ file: 'bow.png', kind: 'equipment' }),
  claymore: Object.freeze({ file: 'claymore.png', kind: 'equipment' }),
  'coral-blade': Object.freeze({ file: 'coral-blade.png', kind: 'equipment' }),
  cutlass: Object.freeze({ file: 'cutlass.png', kind: 'equipment' }),
  daggers: Object.freeze({ file: 'daggers.png', kind: 'equipment' }),
  'diamond-sword': Object.freeze({ file: 'diamond-sword.png', kind: 'equipment' }),
  'double-axe': Object.freeze({ file: 'double-axe.png', kind: 'equipment' }),
  'death-cap-mushroom': Object.freeze({ file: 'death-cap-mushroom.png', kind: 'artifact' }),
  gauntlets: Object.freeze({ file: 'gauntlets.png', kind: 'equipment' }),
  glaive: Object.freeze({ file: 'glaive.png', kind: 'equipment' }),
  'great-hammer': Object.freeze({ file: 'great-hammer.png', kind: 'equipment' }),
  'hunters-armor': Object.freeze({ file: 'hunters-armor.png', kind: 'equipment' }),
  katana: Object.freeze({ file: 'katana.png', kind: 'equipment' }),
  mace: Object.freeze({ file: 'mace.png', kind: 'equipment' }),
  'obsidian-claymore': Object.freeze({ file: 'obsidian-claymore.png', kind: 'equipment' }),
  pickaxe: Object.freeze({ file: 'pickaxe.png', kind: 'equipment' }),
  rapier: Object.freeze({ file: 'rapier.png', kind: 'equipment' }),
  sharpness: Object.freeze({ file: 'sharpness.png', kind: 'enchantment' }),
  sickles: Object.freeze({ file: 'sickles.png', kind: 'equipment' }),
  'soul-knife': Object.freeze({ file: 'soul-knife.png', kind: 'equipment' }),
  'soul-scythe': Object.freeze({ file: 'soul-scythe.png', kind: 'equipment' }),
  spear: Object.freeze({ file: 'spear.png', kind: 'equipment' }),
  sword: Object.freeze({ file: 'sword.png', kind: 'equipment' }),
  swirling: Object.freeze({ file: 'swirling.png', kind: 'enchantment' }),
  'tempest-knife': Object.freeze({ file: 'tempest-knife.png', kind: 'equipment' }),
  'regular-bullet': Object.freeze({ file: 'regular-bullet.png', kind: 'built-in-property' }),
  'unique-bullet': Object.freeze({ file: 'unique-bullet.png', kind: 'built-in-property' }),
  'void-touched-blades': Object.freeze({ file: 'void-touched-blades.png', kind: 'equipment' }),
  whip: Object.freeze({ file: 'whip.png', kind: 'equipment' }),
});

export function iconAssetPath(id) {
  return iconAssets[id]?.file;
}

export function iconAssetUrl(id) {
  const file = iconAssetPath(id);
  if (!file) throw new Error(`未登錄的圖標 ID：${id}`);
  return new URL(`../assets/${file}`, import.meta.url);
}
