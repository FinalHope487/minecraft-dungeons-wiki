import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Script, runInNewContext } from 'node:vm';
import { createFileAppSource } from '../tools/file-app.mjs';

const projectRoot = new URL('../', import.meta.url);
const readProjectFile = (path) => readFile(new URL(path, projectRoot), 'utf8');

test('HTML entry uses a classic loader with a self-contained file URL path', async () => {
  const html = await readProjectFile('index.html');
  assert.match(html, /<script\s+src="\.\/src\/loader\.js"\s+defer><\/script>/);
  assert.doesNotMatch(html, /<script[^>]+type="module"/);

  const loader = await readProjectFile('src/loader.js');
  assert.match(loader, /location\.protocol\s*===\s*['"]file:/);
  assert.match(loader, /\.\/src\/file-app\.js/);
  assert.match(loader, /import\(['"]\.\/wiki\.js['"]\)/);

  const appendedScripts = [];
  runInNewContext(loader, {
    location: { protocol: 'file:' },
    document: {
      createElement: (tag) => ({ tag }),
      head: { append: (script) => appendedScripts.push(script) },
      getElementById: () => null,
    },
    console,
  });
  assert.equal(appendedScripts.length, 1);
  assert.equal(appendedScripts[0].src, './src/file-app.js');
  appendedScripts[0].onerror();
  assert.equal(appendedScripts.length, 2, 'root index must fall back to its generated dist bundle');
  assert.equal(appendedScripts[1].src, './dist/src/file-app.js');

  const modules = Object.fromEntries(await Promise.all([
    ['routes', 'src/routes.mjs'],
    ['inventoryGrid', 'src/inventory-grid.mjs'],
    ['locale', 'src/locale.mjs'],
    ['iconAssets', 'src/icon-assets.mjs'],
    ['wiki', 'src/wiki.js'],
  ].map(async ([key, path]) => [key, await readProjectFile(path)])));
  const bundle = createFileAppSource({
    modules,
    catalog: { index: { schemaVersion: 4, categories: [], entries: [] }, entries: {} },
  });
  assert.doesNotMatch(bundle, /\bimport\.meta\b|^\s*import\s/m);
  assert.match(bundle, /globalThis\.__WIKI_FILE_DATA__/);
  assert.doesNotThrow(() => new Script(bundle));
});
