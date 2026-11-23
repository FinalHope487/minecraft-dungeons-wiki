import { cp, mkdir, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadCatalog, validateCatalog, writeCatalogArtifacts } from './catalog.mjs';
import { createFileAppSource } from './file-app.mjs';
import { buildLlmWikiPages } from './llm-wiki-site.mjs';

const siteFiles = ['index.html', 'assets', 'src', 'slides'];
const root = new URL('../', import.meta.url);
const destination = new URL('dist/', root);
const assets = new Set(await readdir(new URL('assets/', root)));
const catalog = loadCatalog();
validateCatalog(catalog, assets);

await mkdir(destination, { recursive: true });
const workspace = await realpath(root);
if (await realpath(destination) !== resolve(workspace, 'dist')) {
  throw new Error('dist 必須是工作區內的實體目錄。');
}
for (const previous of await readdir(destination, { withFileTypes: true })) {
  if (previous.isSymbolicLink()) throw new Error(`請移除 dist 內的連結：${previous.name}`);
}
for (const name of [...siteFiles, 'content', 'data', 'llm-wiki']) {
  const target = new URL(name, destination);
  await rm(target, { recursive: true, force: true });
  if (siteFiles.includes(name)) await cp(new URL(name, root), target, { recursive: true });
}
await writeCatalogArtifacts(destination, { catalog });
const llmWikiPages = buildLlmWikiPages(root);
for (const page of llmWikiPages) {
  const target = new URL(page.path, destination);
  await mkdir(new URL('./', target), { recursive: true });
  await writeFile(target, page.html, 'utf8');
}

const index = JSON.parse(await readFile(new URL('data/catalog-index.json', destination), 'utf8'));
const entries = Object.fromEntries(await Promise.all(index.entries.map(async ({ id }) => [
  id,
  JSON.parse(await readFile(new URL(`data/entries/${id}.json`, destination), 'utf8')),
])));
const moduleFiles = {
  routes: 'src/routes.mjs',
  inventoryGrid: 'src/inventory-grid.mjs',
  locale: 'src/locale.mjs',
  iconAssets: 'src/icon-assets.mjs',
  wiki: 'src/wiki.js',
};
const modules = Object.fromEntries(await Promise.all(Object.entries(moduleFiles).map(async ([key, path]) => [
  key,
  await readFile(new URL(path, root), 'utf8'),
])));
const fileApp = createFileAppSource({ modules, catalog: { index, entries } });
await writeFile(new URL('src/file-app.js', destination), fileApp, 'utf8');
console.log(`dist/ 已建置，${catalog.categories.length} 個分類、${catalog.entries.length} 筆條目、${llmWikiPages.length} 頁 LLM Wiki。`);
