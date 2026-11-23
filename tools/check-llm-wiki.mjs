// LLM Wiki 檢查節點：Wiki 數字 ↔ SQLite、Wiki 來源標記、簡報 ↔ Wiki 對照。
// 用法：node tools/check-llm-wiki.mjs   （任一項失敗時 exit code 1）
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const wikiDir = 'llm-wiki/wiki/';
const rawDir = 'llm-wiki/raw/';

export function overviewCounts(markdown) {
  const rows = {};
  for (const line of markdown.split('\n')) {
    const m = line.match(/^\| (\S+) \| (\d+) \| (\d+) \| (\d+) \|/);
    if (m) rows[m[1]] = { n: +m[2], unimpl: +m[3], seasonal: +m[4] };
  }
  return rows;
}

export function untaggedNumberLines(markdown) {
  // 含數字或百分比的條列／表格列，必須有 〔R…〕、〔推論〕、〔來源未列出〕 或指到其他 W 頁。
  return markdown.split('\n').filter((line) =>
    /^(\||- |\d+\.)/.test(line.trim())
    && /\d+(%|\s*秒|\s*件|\s*個)/.test(line)
    && !/〔(R\d|推論|來源未列出)/.test(line)
    && !/\[W\d\]/.test(line));
}

export function unsourcedGlossaryRows(markdown) {
  // 名詞表的定義沒有數字，C-03 抓不到；每個名詞列都要有 〔R…〕。
  // 每張表的表頭是分隔列（|---|、|:---|）的上一行；表頭與分隔列都不算資料列。
  const lines = markdown.split('\n').map((line) => line.trim());
  const isSep = (line) => /^\|[\s:|-]+\|$/.test(line);
  return lines.filter((line, k) => line.startsWith('|') && !isSep(line) && !isSep(lines[k + 1] ?? ''))
    .filter((line) => !/〔R\d/.test(line));
}

export function baselessInferences(markdown) {
  // 〔推論〕 要寫出從哪幾篇 raw 推得，例如 〔推論，由 R2-2 推得〕。
  return [...markdown.matchAll(/〔推論[^〕]*〕/g)].map((m) => m[0]).filter((tag) => !/由 ?R\d/.test(tag));
}

export function slideSources(html) {
  return [...html.matchAll(/data-src="([^"]+)"/g)].map((m) => m[1]);
}

export function slideNumbers(html) {
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
  return [...new Set(text.match(/[+]?\d+(?:\.\d+)?(?:%|\s?秒)/g) ?? [])];
}

const labelToCategory = {
  近戰: 'equipment', 遠程: 'ranged', 盔甲: 'armor', 神器: 'artifacts',
  附魔: 'enchantments', 消耗品: 'consumables', 其他物品: 'other-items',
};

export function run() {
  const results = [];
  const check = (name, ok, detail = '') => results.push({ name, ok, detail });

  // C-01：raw 至少 5 篇，且每篇有 https 來源
  const raws = readdirSync(new URL(rawDir, root)).filter((f) => f.endsWith('.md'));
  check('C-01 raw 來源 ≥ 5 篇', raws.length >= 5, `${raws.length} 篇`);
  for (const f of raws) check(`C-01 ${f} 有來源 URL`, /https:\/\//.test(read(rawDir + f)));

  // C-02：overview 數字 = SQLite
  const db = new DatabaseSync(new URL('content/catalog.sqlite', root), { readOnly: true });
  const actual = Object.fromEntries(db.prepare(`select category_id id, count(*) n,
    sum(implemented = 0) unimpl, sum(seasonal) seasonal from entries group by category_id`).all()
    .map((r) => [r.id, { n: r.n, unimpl: r.unimpl, seasonal: r.seasonal }]));
  const claimed = overviewCounts(read(wikiDir + 'overview.md'));
  for (const [label, id] of Object.entries(labelToCategory)) {
    const c = claimed[label]; const a = actual[id];
    check(`C-02 ${label} 數字 = SQLite`, !!c && JSON.stringify(c) === JSON.stringify(a),
      `wiki ${JSON.stringify(c)} / db ${JSON.stringify(a)}`);
  }

  // C-03：每頁 wiki 的數字行都有來源標記
  const pages = readdirSync(new URL(wikiDir, root)).filter((f) => f.endsWith('.md') && !['index.md', 'log.md'].includes(f));
  for (const f of pages) {
    const bad = untaggedNumberLines(read(wikiDir + f));
    check(`C-03 ${f} 數字行皆有來源`, bad.length === 0, bad.join(' ⏎ '));
  }

  // C-07：名詞定義有來源；〔推論〕寫出依據（沒有數字的句子 C-03 管不到）
  const glossaryBad = unsourcedGlossaryRows(read(wikiDir + 'glossary.md'));
  check('C-07 glossary.md 每個名詞都有來源', glossaryBad.length === 0, glossaryBad.join(' ⏎ '));
  for (const f of pages) {
    const bad = baselessInferences(read(wikiDir + f));
    check(`C-07 ${f} 的〔推論〕都寫出依據`, bad.length === 0, bad.join(' '));
  }

  // C-04：每張投影片都指到存在的 wiki 頁或文件
  const sources = slideSources(read('slides/index.html'));
  sources.forEach((s, k) => {
    const page = s.match(/W\d\s+([\w-]+\.md)/)?.[1];
    const ok = page ? existsSync(new URL(wikiDir + page, root)) : existsSync(new URL(s, root));
    check(`C-04 投影片 ${k + 1} → ${s}`, ok);
  });
  // C-05：每頁 wiki 概念頁至少被一張投影片引用
  for (const f of pages) check(`C-05 ${f} 有被簡報引用`, sources.some((s) => s.includes(f)));

  // C-06：簡報裡的每個百分比／秒數都能在 wiki 找到（防止生成簡報時改掉或編出數字）
  const wikiText = pages.map((f) => read(wikiDir + f)).join('\n');
  for (const token of slideNumbers(read('slides/index.html'))) {
    check(`C-06 簡報數字「${token}」出現在 wiki`, wikiText.includes(token));
  }

  return results;
}

if (process.argv[1]?.endsWith('check-llm-wiki.mjs')) {
  const results = run();
  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail && !r.ok ? `  ← ${r.detail}` : ''}`);
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} 通過`);
  process.exitCode = failed ? 1 : 0;
}
