export const inventoryColumnCounts = Object.freeze([2, 3, 4, 5, 6]);
export const defaultInventoryColumnCount = 3;

export function resolveInventoryColumnCount(value) {
  const count = Number(value);
  return inventoryColumnCounts.includes(count) ? count : defaultInventoryColumnCount;
}

export function getInventoryEmptySlotCount(itemCount, columnCount) {
  if (!Number.isInteger(itemCount) || itemCount < 0) {
    throw new RangeError(`物品數量必須是非負整數：${itemCount}`);
  }
  if (!inventoryColumnCounts.includes(columnCount)) {
    throw new RangeError(`每列格數不支援：${columnCount}`);
  }
  const filledSlots = Math.max(columnCount * 4, Math.ceil(itemCount / columnCount) * columnCount);
  return filledSlots - itemCount;
}
