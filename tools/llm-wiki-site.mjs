// 把 llm-wiki/ 的 Markdown 轉成靜態 HTML，輸出到 dist/llm-wiki/。
// 只支援 llm-wiki 用到的語法：標題、段落、清單、表格、程式碼區塊、粗體、行內程式碼、連結。
import { readFileSync, readdirSync } from 'node:fs';
import { posix } from 'node:path';

const repoUrl = 'https://github.com/FinalHope487/minecraft-dungeons-wiki/blob/main/';
const slidesPage = 'llm-wiki/slides.html';

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// 來源檔（repo 相對路徑）→ 網站路徑（dist/ 相對路徑）；不在站上的檔回 null。
export function sitePath(repoPath) {
  const m = repoPath.match(/^llm-wiki\/(wiki|raw)\/([\w-]+)\.md$/);
  if (!m) return null;
  return m[1] === 'wiki' ? `llm-wiki/${m[2]}.html` : `llm-wiki/raw/${m[2]}.html`;
}

// 把 Markdown 裡的連結改成站內 HTML 或 GitHub 原始檔。
export function resolveHref(href, fromRepoPath) {
  if (/^(https?:|#|mailto:)/.test(href)) return href;
  const [path, hash = ''] = href.split('#');
  const target = posix.normalize(posix.join(posix.dirname(fromRepoPath), path));
  const page = sitePath(target);
  const suffix = hash ? `#${hash}` : '';
  if (!page) return repoUrl + target + suffix;
  return posix.relative(posix.dirname(sitePath(fromRepoPath)), page) + suffix;
}

function inline(text, link) {
  const codes = [];
  let html = escapeHtml(text).replace(/`([^`]+)`/g, (_, code) => `\u0000${codes.push(code) - 1}\u0000`);
  html = html
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => `<a href="${escapeHtml(link(href.replace(/&amp;/g, '&')))}">${label}</a>`)
    .replace(/&lt;(https?:\/\/[^\s&]+)&gt;/g, (_, url) => `<a href="${url}">${url}</a>`)
    .replace(/〔[^〕]*〕/g, (tag) => `<span class="tag">${tag}</span>`);
  return html.replace(/\u0000(\d+)\u0000/g, (_, k) => `<code>${codes[k]}</code>`);
}

const cells = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
const isTableSep = (line) => /^\|[\s:|-]+\|$/.test(line.trim());

export function renderMarkdown(markdown, link = (href) => href) {
  const lines = markdown.replace(/\r/g, '').split('\n');
  const out = [];
  let k = 0;
  while (k < lines.length) {
    const line = lines[k];
    const fence = line.match(/^```(\w*)/);
    if (fence) {
      const body = [];
      for (k += 1; k < lines.length && !lines[k].startsWith('```'); k += 1) body.push(lines[k]);
      k += 1;
      out.push(`<pre${fence[1] ? ` data-lang="${fence[1]}"` : ''}><code>${escapeHtml(body.join('\n'))}</code></pre>`);
      continue;
    }
    const heading = line.match(/^(#{1,4}) (.+)/);
    if (heading) {
      out.push(`<h${heading[1].length}>${inline(heading[2], link)}</h${heading[1].length}>`);
      k += 1;
      continue;
    }
    if (line.trim().startsWith('|') && isTableSep(lines[k + 1] ?? '')) {
      const head = cells(line).map((c) => `<th>${inline(c, link)}</th>`).join('');
      const rows = [];
      for (k += 2; k < lines.length && lines[k].trim().startsWith('|'); k += 1) {
        rows.push(`<tr>${cells(lines[k]).map((c) => `<td>${inline(c, link)}</td>`).join('')}</tr>`);
      }
      out.push(`<div class="table"><table><thead><tr>${head}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`);
      continue;
    }
    const list = line.match(/^(- |\d+\. )/);
    if (list) {
      const ordered = list[1] !== '- ';
      const pattern = ordered ? /^\d+\. / : /^- /;
      const items = [];
      while (k < lines.length && pattern.test(lines[k])) {
        let item = lines[k].replace(pattern, '');
        for (k += 1; k < lines.length && /^\s{2,}\S/.test(lines[k]) && !/^\s*(- |\d+\. )/.test(lines[k]); k += 1) item += ` ${lines[k].trim()}`;
        items.push(`<li>${inline(item, link)}</li>`);
        while (k < lines.length && /^\s+(- |\d+\. )/.test(lines[k])) {
          items[items.length - 1] = items.at(-1).replace('</li>', `<br>${inline(lines[k].trim().replace(/^(- |\d+\. )/, '· '), link)}</li>`);
          k += 1;
        }
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.join('')}</${tag}>`);
      continue;
    }
    if (!line.trim()) { k += 1; continue; }
    const para = [line.trim()];
    for (k += 1; k < lines.length && lines[k].trim() && !/^(#|```|- |\d+\. |\|)/.test(lines[k].trim()); k += 1) para.push(lines[k].trim());
    out.push(`<p>${inline(para.join(' '), link)}</p>`);
  }
  return out.join('\n');
}

// 內部編號（W1 ·、R1 ·）只給檢查器與來源標記用，網頁上的標題與目錄不顯示。
export const stripPageNumber = (title) => title.replace(/^[WR]\d+\s*·\s*/, '');
const pageTitle = (markdown) => stripPageNumber(markdown.match(/^# (.+)/m)?.[1].trim() ?? '');

function layout({ title, body, nav, depth, current }) {
  const up = '../'.repeat(depth);
  const items = nav.map((group) => `<p class="nav-group">${group.label}</p><ol>${group.pages.map((p) => {
    const href = posix.relative(posix.dirname(current), p.path) || posix.basename(p.path);
    return `<li><a href="${href}"${p.path === current ? ' aria-current="page"' : ''}>${escapeHtml(p.title)}</a></li>`;
  }).join('')}</ol>`).join('');
  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#161012">
  <title>${escapeHtml(title)} · LLM Wiki · 地城圖鑑</title>
  <link rel="icon" href="${up}assets/diamond-sword.webp">
  <link rel="stylesheet" href="${up}src/llm-wiki.css">
</head>
<body>
  <header class="bar">
    <a class="home" href="${up}">← 地城圖鑑</a>
    <span class="bar-title" lang="en">LLM Wiki</span>
  </header>
  <div class="layout">
    <nav class="side" aria-label="LLM Wiki 頁面">${items}</nav>
    <main class="doc">
${body}
    </main>
  </div>
</body>
</html>
`;
}

// 讀 llm-wiki/，回傳 [{ path: 'llm-wiki/xxx.html', html }]。
export function buildLlmWikiPages(root) {
  const read = (p) => readFileSync(new URL(p, root), 'utf8');
  const list = (dir) => readdirSync(new URL(dir, root)).filter((f) => f.endsWith('.md')).sort();
  const sources = [
    ...['index.md', ...list('llm-wiki/wiki/').filter((f) => !['index.md', 'log.md'].includes(f)), 'log.md'].map((f) => `llm-wiki/wiki/${f}`),
    ...list('llm-wiki/raw/').map((f) => `llm-wiki/raw/${f}`),
  ];
  const docs = sources.map((repoPath) => {
    const original = read(repoPath);
    // 目錄依原本的 W／R 編號排序；index.md 沒有編號，排第一。
    const order = Number(original.match(/^# [WR](\d+)/m)?.[1] ?? 0);
    const markdown = original.replace(/^# (.+)/m, (_, title) => `# ${stripPageNumber(title)}`);
    return { repoPath, markdown, order, path: sitePath(repoPath), title: pageTitle(markdown) };
  });
  const group = (test) => docs.filter((d) => test(d.repoPath)).sort((a, b) => a.order - b.order)
    .map(({ path, title }) => ({ path, title }));
  const nav = [
    { label: '概念頁', pages: group((p) => p.includes('/wiki/') && !p.endsWith('log.md')) },
    { label: '原始來源', pages: group((p) => p.includes('/raw/')) },
    { label: '執行紀錄', pages: group((p) => p.endsWith('log.md')) },
    { label: '教學簡報', pages: [{ path: slidesPage, title: '教學簡報（17 頁）' }] },
  ];
  const slides = {
    path: slidesPage,
    html: layout({
      title: '教學簡報',
      body: '<div class="slides-head"><h1>教學簡報</h1><a class="home" href="../slides/">全螢幕開啟 ↗</a></div>\n'
        + '<iframe class="slides" src="../slides/" title="教學簡報：用 ← → 換頁"></iframe>',
      nav,
      depth: 1,
      current: slidesPage,
    }),
  };
  return [...docs.map((doc) => ({
    path: doc.path,
    html: layout({
      title: doc.title,
      body: renderMarkdown(doc.markdown, (href) => resolveHref(href, doc.repoPath)),
      nav,
      depth: doc.path.split('/').length - 1,
      current: doc.path,
    }),
  })), slides];
}
