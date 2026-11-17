const moduleDefinitions = [
  {
    key: 'routes',
    names: ['allCategory', 'defaultLayout', 'entryHash', 'listEntries', 'resolveRoute'],
  },
  {
    key: 'inventoryGrid',
    names: ['defaultInventoryColumnCount', 'getInventoryEmptySlotCount', 'inventoryColumnCounts', 'resolveInventoryColumnCount'],
  },
  {
    key: 'locale',
    names: ['resolveLanguage', 'uiText'],
  },
  {
    key: 'iconAssets',
    names: ['iconAssetUrl'],
  },
  {
    key: 'builtInEnchantmentPresentation',
    names: ['buildBuiltInEnchantmentPresentation'],
  },
];

function removeImports(source, label) {
  const result = source.replace(/^import\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];[ \t]*\r?\n/gm, '');
  if (/^\s*import\s/m.test(result)) throw new Error(`${label} 含未支援的 import。`);
  return result;
}

function wrapModule(source, names, label) {
  const body = removeImports(source, label).replace(/^export\s+/gm, '');
  if (/^\s*export\s/m.test(body)) throw new Error(`${label} 含未支援的 export。`);
  const returned = names.join(', ');
  return `const { ${returned} } = (() => {\n${body}\nreturn { ${returned} };\n})();`;
}

function replaceRequired(source, pattern, replacement, label) {
  const result = source.replace(pattern, replacement);
  if (result === source) throw new Error(`${label} 的模組網址轉換目標不存在。`);
  return result;
}

export function createFileAppSource({ modules, catalog }) {
  if (!modules || !catalog?.index || !catalog?.entries || catalog.index.schemaVersion !== 5) {
    throw new TypeError('file:// 圖鑑 bundle 缺少 schema v5 分類索引或詳情資料。');
  }

  const bundledModules = moduleDefinitions.map(({ key, names }) => {
    if (typeof modules[key] !== 'string') throw new TypeError(`file:// bundle 缺少模組原始碼：${key}`);
    let source = modules[key];
    if (key === 'iconAssets') {
      source = replaceRequired(
        source,
        /new URL\(`\.\.\/assets\/\$\{file\}`, import\.meta\.url\)/,
        'new URL(`./assets/${file}`, document.baseURI)',
        key,
      );
    }
    return wrapModule(source, names, key);
  });

  let app = removeImports(modules.wiki, 'wiki.js');
  app = replaceRequired(
    app,
    /const dataDirectory = new URL\('\.\.\/data\/', import\.meta\.url\);/,
    "const dataDirectory = new URL('./data/', document.baseURI);",
    'wiki.js',
  );
  if (/\bimport\.meta\b|^\s*import\s|^\s*export\s/m.test(app)) {
    throw new Error('file:// bundle 仍含 ES module 語法。');
  }

  return [
    `globalThis.__WIKI_FILE_DATA__ = ${JSON.stringify(catalog)};`,
    ...bundledModules,
    app,
  ].join('\n\n');
}
