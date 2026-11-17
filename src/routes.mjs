export const defaultLayout = 'inventory';
export const layouts = [defaultLayout, 'compact'];
export const allCategory = { id: 'all' };

export function entryHash(entry, layout, categoryId = entry.category) {
  return `#${categoryId}/${entry.id}/${layout}`;
}

export function listEntries(category, categories, entries) {
  const included = category?.id === allCategory.id
    ? categories.filter((item) => item.group === 'equipment').map((item) => item.id)
    : [category?.id];
  return entries.filter((entry) => included.includes(entry.category));
}

export function resolveRoute(hash, categories, entries) {
  const [categoryId, entryId, requestedLayout, extra] = hash.slice(1).split('/');
  const layout = layouts.includes(requestedLayout) ? requestedLayout : defaultLayout;
  const category = categoryId === allCategory.id ? allCategory : categories.find((item) => item.id === categoryId);
  const listed = listEntries(category, categories, entries);
  const entry = listed.find((item) => item.id === entryId);
  if (!hash || hash === '#') {
    const allEntries = listEntries(allCategory, categories, entries);
    return { category: allCategory, entry: allEntries.find((item) => item.id === 'sword') ?? allEntries[0], layout };
  }
  if (!category || extra !== undefined || (entryId && !entry)) {
    return { category, layout, missing: true };
  }
  return { category, layout, entry: entry ?? listed[0] };
}
