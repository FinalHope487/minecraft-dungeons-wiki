import { cp, mkdir, readdir, realpath, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadCatalog, validateCatalog, writeCatalogArtifacts } from './catalog.mjs';

const siteFiles = ['index.html', 'assets', 'src'];
const root = new URL('../', import.meta.url);
const destination = new URL('dist/', root);
const assets = new Set(await readdir(new URL('assets/', root)));
const catalog = loadCatalog();
validateCatalog(catalog.categories, catalog.entries, assets);

await mkdir(destination, { recursive: true });
const workspace = await realpath(root);
if (await realpath(destination) !== resolve(workspace, 'dist')) {
  throw new Error('dist 必須是工作區內的實體目錄。');
}
for (const previous of await readdir(destination, { withFileTypes: true })) {
  if (previous.isSymbolicLink()) throw new Error(`請移除 dist 內的連結：${previous.name}`);
}
for (const name of [...siteFiles, 'content', 'data']) {
  const target = new URL(name, destination);
  await rm(target, { recursive: true, force: true });
  if (siteFiles.includes(name)) await cp(new URL(name, root), target, { recursive: true });
}
await writeCatalogArtifacts(destination, { catalog });
console.log(`dist/ 已建置，${catalog.categories.length} 個分類、${catalog.entries.length} 筆條目。`);
