import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog } from '../tools/catalog.mjs';
import { buildBuiltInEnchantmentPresentation } from '../src/built-in-enchantment-presentation.mjs';
import { builtInIconRecipe } from '../src/icon-assets.mjs';

const { entries, iconRecipes } = loadCatalog();

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
  const recipes = Object.fromEntries(iconRecipes.map((recipe) => [recipe.id, recipe]));
  const counts = { 'unique-bullet': 0, 'regular-bullet': 0 };
  for (const entry of entries.filter(({ category }) => ['equipment', 'ranged'].includes(category))) {
    for (const relation of entry.links.filter(({ builtInEnchantment }) => builtInEnchantment)) {
      const { propertyIcon, propertyTraitIndex } = relation.builtInEnchantment;
      assert.equal(entry.traits[propertyTraitIndex]?.icon, propertyIcon, `${entry.id} → ${relation.id}`);
      const recipe = builtInIconRecipe(propertyIcon, recipes);
      assert.equal(recipe.overlayPercent, 81);
      assert.equal(recipe.frameStyle, propertyIcon === 'unique-bullet' ? 'none' : 'orange');
      counts[propertyIcon]++;
    }
  }
  assert.deepEqual(counts, { 'unique-bullet': 97, 'regular-bullet': 20 });
  assert.equal(builtInIconRecipe('unique-bullet', { built_in_enchantment: recipes.built_in_enchantment }),
    recipes.built_in_enchantment);
});
