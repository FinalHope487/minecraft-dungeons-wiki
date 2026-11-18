export function iconAssetUrl(id, registry) {
  const asset = registry?.[id];
  if (!asset || typeof asset.file !== 'string' || !/^[^/\\]+\.png$/i.test(asset.file)) {
    throw new Error(`圖標登錄缺少安全的 PNG 檔案映射：${id}`);
  }
  return new URL(`../assets/${asset.file}`, import.meta.url);
}
