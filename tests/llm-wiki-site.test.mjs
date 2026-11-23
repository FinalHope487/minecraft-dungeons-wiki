import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { renderMarkdown, resolveHref, buildLlmWikiPages } from '../tools/llm-wiki-site.mjs';

test('renderMarkdown 轉出標題、表格、清單、程式碼與來源標記', () => {
  const html = renderMarkdown('# 標題\n\n| a | b |\n|---|---|\n| **x** | `y` |\n\n- 一〔R1〕\n- 二\n\n```\n<b>\n```');
  assert.match(html, /<h1>標題<\/h1>/);
  assert.match(html, /<th>a<\/th><th>b<\/th>/);
  assert.match(html, /<td><strong>x<\/strong><\/td><td><code>y<\/code><\/td>/);
  assert.match(html, /<ul><li>一<span class="tag">〔R1〕<\/span><\/li><li>二<\/li><\/ul>/);
  assert.match(html, /<pre><code>&lt;b&gt;<\/code><\/pre>/);
});

test('resolveHref 把 Wiki 與來源的 .md 連結改成站內 HTML，其他檔連到 GitHub', () => {
  assert.equal(resolveHref('overview.md', 'llm-wiki/wiki/index.md'), 'overview.html');
  assert.equal(resolveHref('../raw/08-gameplay.md', 'llm-wiki/wiki/index.md'), 'raw/08-gameplay.html');
  assert.equal(resolveHref('../wiki/log.md#c', 'llm-wiki/raw/08-gameplay.md'), '../log.html#c');
  assert.equal(resolveHref('../../content/catalog.sqlite', 'llm-wiki/wiki/overview.md'),
    'https://github.com/FinalHope487/minecraft-dungeons-wiki/blob/main/content/catalog.sqlite');
  assert.equal(resolveHref('https://minecraft.wiki/w/X', 'llm-wiki/wiki/index.md'), 'https://minecraft.wiki/w/X');
});

test('每篇概念頁與來源都輸出成一頁，站內不留 .md 連結', () => {
  const root = new URL('../', import.meta.url);
  const count = (dir) => readdirSync(new URL(dir, root)).filter((f) => f.endsWith('.md')).length;
  const pages = buildLlmWikiPages(root);
  assert.equal(pages.length, count('llm-wiki/wiki/') + count('llm-wiki/raw/') + 1); // +1 教學簡報頁
  for (const page of pages) {
    assert.doesNotMatch(page.html, /href="(?!https:)[^"]*\.md[#"]/, page.path);
  }
});

test('網頁標題與目錄去掉內部編號，目錄仍依 W／R 順序並附教學簡報', () => {
  const pages = buildLlmWikiPages(new URL('../', import.meta.url));
  const overview = pages.find((p) => p.path === 'llm-wiki/overview.html').html;
  assert.match(overview, /<h1>Minecraft Dungeons 是什麼<\/h1>/);
  const nav = overview.match(/<nav class="side"[\s\S]*?<\/nav>/)[0];
  assert.doesNotMatch(nav, />[WR]\d+ ·/);
  const concept = [...nav.split('原始來源')[0].matchAll(/href="([\w-]+)\.html"/g)].map((m) => m[1]);
  assert.deepEqual(concept.slice(0, 3), ['index', 'overview', 'equipment-types']);
  assert.match(nav, /href="slides\.html"/);
  assert.match(pages.find((p) => p.path === 'llm-wiki/slides.html').html, /<iframe class="slides" src="\.\.\/slides\/"/);
});
