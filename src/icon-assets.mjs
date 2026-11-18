export function iconAssetUrl(id, registry) {
  const asset = registry?.[id];
  if (!asset || typeof asset.file !== 'string' || !/^[^/\\]+\.png$/i.test(asset.file)) {
    throw new Error(`圖標登錄缺少安全的 PNG 檔案映射：${id}`);
  }
  return new URL(`../assets/${asset.file}`, import.meta.url);
}

const defaultRecipeId = 'built_in_enchantment';
const uniqueRecipeId = 'built_in_enchantment_unique';

export function validIconRecipes(recipes) {
  const ids = new Set(recipes.map((recipe) => recipe?.id));
  return ids.size === recipes.length && ids.has(defaultRecipeId) && recipes.every((recipe) =>
    [defaultRecipeId, uniqueRecipeId].includes(recipe?.id)
    && recipe.baseRole === 'property_icon' && recipe.overlayRole === 'target_entry_icon'
    && Number.isInteger(recipe.overlayPercent) && recipe.overlayPercent >= 1 && recipe.overlayPercent <= 100
    && ['none', 'orange'].includes(recipe.frameStyle));
}

export function builtInIconRecipe(propertyIcon, recipesById) {
  return (propertyIcon === 'unique-bullet' ? recipesById[uniqueRecipeId] : null) ?? recipesById[defaultRecipeId];
}
