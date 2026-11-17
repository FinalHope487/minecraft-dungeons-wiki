export function buildBuiltInEnchantmentPresentation(entry, entries) {
  const entriesById = new Map(entries.map((candidate) => [candidate.id, candidate]));
  const enchantmentByTrait = new Map();
  const related = entry.links.map((relation) => {
    const target = entriesById.get(relation.id);
    if (!target) throw new Error(`條目 ${entry.id} 的關聯目標不存在：${relation.id}`);

    const metadata = relation.builtInEnchantment;
    if (metadata) {
      const trait = entry.traits[metadata.propertyTraitIndex];
      if (!Number.isInteger(metadata.propertyTraitIndex) || !trait || trait.icon !== metadata.propertyIcon
        || enchantmentByTrait.has(metadata.propertyTraitIndex)) {
        throw new Error(`武器內建附魔未對應至唯一特性列：${entry.id} → ${relation.id}`);
      }
      enchantmentByTrait.set(metadata.propertyTraitIndex, {
        id: target.id,
        icon: target.icon,
        propertyIcon: metadata.propertyIcon,
      });
    }

    return { target, label: relation.label, builtInEnchantment: metadata ?? null };
  });

  return {
    traits: entry.traits.map((trait, index) => ({
      ...trait,
      builtInEnchantmentIcon: enchantmentByTrait.get(index) ?? null,
    })),
    related,
  };
}
