import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog } from '../tools/catalog.mjs';
import { buildBuiltInEnchantmentPresentation } from '../src/built-in-enchantment-presentation.mjs';

const { entries } = loadCatalog();

test('內建附魔圖標疊在對應 Bullet 特性列，關聯列保留原圖標', () => {
  const anchor = entries.find(({ id }) => id === 'anchor');
  const presentation = buildBuiltInEnchantmentPresentation(anchor, entries);
  const gravityLink = presentation.related.find(({ target }) => target.id === 'gravity');

  assert.equal(presentation.traits[0].builtInEnchantmentIcon, null);
  assert.equal(presentation.traits[1].builtInEnchantmentIcon, null);
  assert.deepEqual(presentation.traits[2].builtInEnchantmentIcon, {
    id: 'gravity',
    icon: 'gravity',
    propertyIcon: 'regular-bullet',
  });
  assert.equal(gravityLink.target.icon, 'gravity');
  assert.equal(Object.hasOwn(gravityLink, 'builtInEnchantmentIcon'), false);
});

test('武器 Bullet 特性列索引指向實際 Bullet 圖標', () => {
  for (const entry of entries.filter(({ category }) => ['equipment', 'ranged'].includes(category))) {
    for (const relation of entry.links.filter(({ builtInEnchantment }) => builtInEnchantment)) {
      const { propertyIcon, propertyTraitIndex } = relation.builtInEnchantment;
      assert.equal(entry.traits[propertyTraitIndex]?.icon, propertyIcon, `${entry.id} → ${relation.id}`);
    }
  }
});
