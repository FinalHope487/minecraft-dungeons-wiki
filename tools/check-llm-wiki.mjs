// LLM Wiki 檢查節點：Wiki 數字 ↔ SQLite、Wiki 來源標記、目錄與討論紀錄、簡報 ↔ Wiki 對照。
// 用法：node tools/check-llm-wiki.mjs   （任一項失敗時 exit code 1）
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const defaultRoot = new URL('../', import.meta.url);
const wikiDir = 'llm-wiki/wiki/';
const rawDir = 'llm-wiki/raw/';
const notConceptPages = ['index.md', 'log.md'];

export function overviewCounts(markdown) {
  const rows = {};
  for (const line of markdown.split('\n')) {
    const m = line.match(/^\| (\S+) \| (\d+) \| (\d+) \| (\d+) \|/);
    if (m) rows[m[1]] = { n: +m[2], unimpl: +m[3], seasonal: +m[4] };
  }
  return rows;
}

// 不含 ``` 程式碼區塊的內容行。標記與數字檢查都只看這些行。
function contentLines(markdown) {
  const lines = [];
  let inFence = false;
  for (const line of markdown.split('\n')) {
    if (line.trimStart().startsWith('```')) { inFence = !inFence; continue; }
    if (!inFence) lines.push(line);
  }
  return lines;
}

const isTableSeparator = (line) => /^\|[\s:|-]+\|$/.test(line.trim());

// 來源標記只有一套語法，C-03 與來源解析共用：
// 〔R5〕、〔R5-4〕、〔R5 問題段〕（R 編號與事實編號都是不含前導零的正整數）、〔推論…〕、〔來源未列出〕。
// 行內程式碼裡的標記不算；看起來像來源標記卻寫壞的（未閉合、〔R5-abc〕、〔R05〕）要回報，不能降級成合法標記。
const refToken = /^R([1-9]\d*)(?:-([1-9]\d*))?$/;

function tagKind(body) {
  if (/^R\d/.test(body)) return refToken.test(body.split(/\s/, 1)[0]) ? 'ref' : 'malformed';
  if (body.startsWith('推論')) return 'inference';
  if (body === '來源未列出') return 'unlisted';
  return null;
}

function parseTags(line) {
  const text = line.replace(/`[^`]*`/g, ' ');
  const tags = [...text.matchAll(/〔([^〕]*)〕/g)].map(([whole, body]) => ({ whole, body, kind: tagKind(body) }));
  const unclosed = text.replace(/〔[^〕]*〕/g, '').match(/〔(?:R\d|推論|來源未列出)[^〕]*$/)?.[0] ?? null;
  return { tags, unclosed };
}

const hasSourceTag = (line) => parseTags(line).tags.some(({ kind }) => kind && kind !== 'malformed');
const wikiLinkPattern = /\[(W\d+)[^\]]*\]\(([^)\s#]+)(?:#[^)\s]*)?\)/g;

// 去掉不是「事實」的數字：來源標記、程式碼、網址、連結目的地、W／R 編號、檢查編號、清單序號。
function factText(line) {
  return line
    .replace(/〔[^〕]*〕/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<https?:[^>]*>|https?:\/\/\S+/g, ' ')
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/\b[WR]\d+(?:-\d+)?\b/g, ' ')
    .replace(/\bC-\d+\b/g, ' ')
    .replace(/^\s*(?:[-*]\s+)?\d+[.)]\s+/, ' ');
}

function hasValidWikiLink(line, wikiById) {
  return [...line.matchAll(wikiLinkPattern)].some(([, id, file]) => !wikiById || wikiById.get(id)?.file === file);
}

export function untaggedNumberLines(markdown, wikiById) {
  // 頁面可見內容（段落、標題、清單、表格列）只要有阿拉伯數字，同一行就要有 〔R…〕、〔推論〕、〔來源未列出〕，
  // 或指到其他 W 頁的連結（給了 wikiById 時，連結的 W 編號必須和檔名吻合）。
  return contentLines(markdown).filter((line) =>
    !isTableSeparator(line) && /\d/.test(factText(line)) && !hasSourceTag(line) && !hasValidWikiLink(line, wikiById));
}

export function unsourcedGlossaryRows(markdown) {
  // 名詞表的定義沒有數字，C-03 抓不到；每個名詞列都要有 〔R…〕。
  // 每張表的表頭是分隔列（|---|、|:---|）的上一行；表頭與分隔列都不算資料列。
  const lines = markdown.split('\n').map((line) => line.trim());
  return lines.filter((line, k) => line.startsWith('|') && !isTableSeparator(line) && !isTableSeparator(lines[k + 1] ?? ''))
    .filter((line) => !/〔R\d/.test(line));
}

export function baselessInferences(markdown) {
  // 〔推論〕 要寫出從哪幾篇 raw 推得，例如 〔推論，由 R2-2 推得〕。
  return [...markdown.matchAll(/〔推論[^〕]*〕/g)].map((m) => m[0]).filter((tag) => !/由 ?R\d/.test(tag));
}

// 標題 `# R8 · …`／`# W7 · …` 的編號；編號取自文件本身，不從檔名猜。
export function docId(markdown, prefix) {
  const id = markdown.match(new RegExp(`^# (${prefix}[1-9]\\d*) · `, 'm'))?.[1];
  return id && Number.isSafeInteger(Number(id.slice(1))) ? id : null;
}

// raw 的 `## 抽出的事實` 表裡，第一欄是數字的列。
export function rawFactIds(markdown) {
  const section = markdown.split(/^## /m).find((s) => s.startsWith('抽出的事實')) ?? '';
  return [...section.matchAll(/^\| (\d+) \|/gm)].map((m) => Number(m[1]));
}

// entries: [{ file, markdown }] → { byId: Map<id, { file, markdown, factIds? }>, problems: string[] }
export function buildDocMap(entries, prefix) {
  const byId = new Map();
  const problems = [];
  for (const { file, markdown } of entries) {
    const id = docId(markdown, prefix);
    if (!id) { problems.push(`${file} 缺少 # ${prefix}<編號> · 標題`); continue; }
    if (byId.has(id)) { problems.push(`${id} 重複：${byId.get(id).file}、${file}`); continue; }
    const doc = { file, markdown };
    if (prefix === 'R') {
      doc.factIds = rawFactIds(markdown);
      const dup = doc.factIds.filter((n, k) => doc.factIds.indexOf(n) !== k);
      if (dup.length) problems.push(`${id} 的事實編號重複：${[...new Set(dup)].join('、')}`);
    }
    byId.set(id, doc);
  }
  return { byId, problems };
}

// 所有 〔…〕 標記裡的 R 引用（直接來源與〔推論，由 R… 推得〕都算），例如 { id: 'R8', fact: 11 }；
// 另外回報寫壞的標記。
function scanTags(markdown) {
  const refs = [];
  const malformed = [];
  const addRef = (token, whole) => {
    const m = refToken.exec(token);
    if (m) refs.push({ id: `R${m[1]}`, fact: m[2] ? Number(m[2]) : null });
    else malformed.push(whole);
  };
  for (const line of contentLines(markdown)) {
    const { tags, unclosed } = parseTags(line);
    if (unclosed) malformed.push(unclosed);
    for (const { whole, body, kind } of tags) {
      if (kind === 'malformed') malformed.push(whole);
      else if (kind === 'ref') addRef(body.split(/\s/, 1)[0], whole);
      else if (kind === 'inference') for (const token of body.match(/R\d[\w-]*/g) ?? []) addRef(token, whole);
    }
  }
  return { refs, malformed };
}

export function collectRawReferences(markdown) {
  return new Set(scanTags(markdown).refs.map((r) => r.id));
}

export function invalidRawReferences(markdown, rawById) {
  // 寫壞的標記、引用的 raw 不存在，或指定的事實編號不在該 raw 的事實表裡。
  const { refs, malformed } = scanTags(markdown);
  const missing = refs.filter(({ id, fact }) => {
    const raw = rawById.get(id);
    return !raw || (fact !== null && !raw.factIds.includes(fact));
  }).map(({ id, fact }) => (fact === null ? id : `${id}-${fact}`));
  return [...new Set([...malformed.map((tag) => `格式錯誤 ${tag}`), ...missing])];
}

export function invalidWikiLinks(markdown, wikiById) {
  return contentLines(markdown).flatMap((line) => [...line.matchAll(wikiLinkPattern)]
    .filter(([, id, file]) => wikiById.get(id)?.file !== file).map((m) => m[0]));
}

// index 的「用到的 raw」欄：`R1–R6 R8` → { ids: R1 R2 R3 R4 R5 R6 R8, errors: [] }。
// 無法完整解析、編號不是安全的正整數、範圍反向或比 raw 總數還長、含不存在的 raw，都放進 errors，不展開也不中斷。
export function expandRawIds(text, rawById) {
  const ids = new Set();
  const errors = [];
  const leftover = text.replace(/R\d+(?:\s*[–~-]\s*R\d+)?/g, '').replace(/[\s、,，]+/g, '');
  if (leftover) errors.push(`無法解析的內容「${leftover}」`);
  for (const [whole, a, b] of text.matchAll(/R(\d+)(?:\s*[–~-]\s*R(\d+))?/g)) {
    const from = Number(a);
    const to = b === undefined ? from : Number(b);
    if (![from, to].every((n) => Number.isSafeInteger(n) && n >= 1)) errors.push(`${whole} 的編號必須是正整數`);
    else if (from > to) errors.push(`${whole} 範圍反向`);
    else if (to - from + 1 > rawById.size) errors.push(`${whole} 範圍比 raw 總數 ${rawById.size} 還長`);
    else {
      for (let n = from; n <= to; n += 1) {
        if (rawById.has(`R${n}`)) ids.add(`R${n}`);
        else errors.push(`${whole} 含不存在的 R${n}`);
      }
    }
  }
  return { ids, errors };
}

const tableCells = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());

export function validateWikiIndex(markdown, rawById, wikiById) {
  // 只讀 index.md 的「原始來源」「概念頁」兩張表；「簡報對照」不在這裡檢查。
  const errors = [];
  const section = (title) => markdown.split(/^## /m).find((s) => s.startsWith(title)) ?? '';
  // 先取出區段內所有表格資料列（表頭是分隔列的上一行，不算），再驗第一欄的編號；不依賴空白寫法。
  const rowsOf = (title, prefix) => {
    const lines = section(title).split('\n').map((line) => line.trim());
    return lines.filter((line, k) => line.startsWith('|') && !isTableSeparator(line) && !isTableSeparator(lines[k + 1] ?? ''))
      .map(tableCells).filter((row) => {
        const ok = new RegExp(`^${prefix}[1-9]\\d*$`).test(row[0]);
        if (!ok) errors.push(`${title} 有無法辨識編號的列：${row[0] || '（空）'}`);
        return ok;
      });
  };
  const target = (cell) => cell?.match(/\(([^)]+)\)/)?.[1];
  const checkRows = (rows, byId, expectedPath, label) => {
    for (const [id] of byId) {
      const mine = rows.filter((row) => row[0] === id);
      if (mine.length !== 1) errors.push(`${label} ${id} 在 index 有 ${mine.length} 列，應為 1 列`);
    }
    for (const row of rows) if (!byId.has(row[0])) errors.push(`index 列出 ${row[0]}，但沒有對應的檔案`);
    for (const row of rows) {
      const doc = byId.get(row[0]);
      if (doc && target(row[1]) !== expectedPath(doc.file)) errors.push(`${row[0]} 的連結 ${target(row[1])} 不是 ${expectedPath(doc.file)}`);
    }
  };
  const rawRows = rowsOf('原始來源', 'R');
  const wikiRows = rowsOf('概念頁', 'W');
  checkRows(rawRows, rawById, (file) => `../raw/${file}`, '原始來源');
  checkRows(wikiRows, wikiById, (file) => file, '概念頁');
  for (const row of wikiRows) {
    const doc = wikiById.get(row[0]);
    if (!doc) continue;
    const { ids: declared, errors: parseErrors } = expandRawIds(row[3] ?? '', rawById);
    for (const error of parseErrors) errors.push(`${row[0]} 的「用到的 raw」欄：${error}`);
    const actual = collectRawReferences(doc.markdown);
    const missing = [...actual].filter((id) => !declared.has(id));
    const extra = [...declared].filter((id) => !actual.has(id));
    if (missing.length || extra.length) {
      errors.push(`${row[0]} ${doc.file} 的「用到的 raw」與實際引用不同：index 缺少 ${missing.join(' ') || '—'}，index 多出 ${extra.join(' ') || '—'}`);
    }
  }
  return errors;
}

export function validateDiscussionLog(markdown, wikiById) {
  // 每頁概念頁都要被某個 D 紀錄的「涉及概念頁」列出；那筆 D 要寫明受眾、核心問題、範圍。
  // 只認 D 區段內的欄位，I／G／C 紀錄提到頁面不算數。
  const errors = [];
  // 冒號後只吃同一行的空白（[ \t]），空欄位不會被下一行填滿；程式碼區塊裡的示範紀錄不算。
  const field = (body, name) => body.match(new RegExp(`^- \\*\\*${name}\\*\\*[：:][ \\t]*(.*)$`, 'm'))?.[1]?.trim() ?? '';
  const sections = contentLines(markdown).join('\n').split(/^### /m).slice(1)
    .map((s) => ({ head: s.split('\n')[0], body: s.split(/\n## /)[0] }))
    .filter(({ head }) => /^D-\d+ · /.test(head));
  const seen = new Set();
  const covered = new Set();
  for (const { head, body } of sections) {
    const dId = head.match(/^(D-\d+)/)[1];
    if (seen.has(dId)) errors.push(`${dId} 重複`);
    seen.add(dId);
    const pages = [];
    for (const token of field(body, '涉及概念頁').split(/[\s、,，]+/).filter(Boolean)) {
      if (!/^W[1-9]\d*$/.test(token)) errors.push(`${dId} 的「涉及概念頁」有無法辨識的項目：${token}`);
      else if (!wikiById.has(token)) errors.push(`${dId} 列出的 ${token} 沒有對應的概念頁`);
      else { pages.push(token); covered.add(token); }
    }
    if (pages.length) {
      for (const name of ['受眾', '核心問題', '範圍']) if (!field(body, name)) errors.push(`${dId} 缺少「${name}」`);
    }
  }
  for (const [id, { file }] of wikiById) if (!covered.has(id)) errors.push(`${id} ${file} 沒有被任何 D 紀錄的「涉及概念頁」列出`);
  return errors;
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

// workspaceRoot：專案根目錄（路徑字串或 file: URL）；預設是本 repo，測試可改指暫存目錄。
export function run(workspaceRoot = defaultRoot) {
  const root = typeof workspaceRoot === 'string' ? pathToFileURL(resolve(workspaceRoot) + sep) : workspaceRoot;
  const read = (p) => readFileSync(new URL(p, root), 'utf8');
  const markdownFiles = (dir) => readdirSync(new URL(dir, root)).filter((f) => f.endsWith('.md'));
  const results = [];
  const check = (name, ok, detail = '') => results.push({ name, ok, detail });

  // C-01：raw 至少 5 篇，且每篇有 https 來源
  const raws = markdownFiles(rawDir);
  check('C-01 raw 來源 ≥ 5 篇', raws.length >= 5, `${raws.length} 篇`);
  for (const f of raws) check(`C-01 ${f} 有來源 URL`, /https:\/\//.test(read(rawDir + f)));

  // C-02：overview 數字 = SQLite
  const db = new DatabaseSync(new URL('content/catalog.sqlite', root), { readOnly: true });
  let actual;
  try {
    actual = Object.fromEntries(db.prepare(`select category_id id, count(*) n,
      sum(implemented = 0) unimpl, sum(seasonal) seasonal from entries group by category_id`).all()
      .map((r) => [r.id, { n: r.n, unimpl: r.unimpl, seasonal: r.seasonal }]));
  } finally {
    db.close();
  }
  const claimed = overviewCounts(read(wikiDir + 'overview.md'));
  for (const [label, id] of Object.entries(labelToCategory)) {
    const c = claimed[label]; const a = actual[id];
    check(`C-02 ${label} 數字 = SQLite`, !!c && JSON.stringify(c) === JSON.stringify(a),
      `wiki ${JSON.stringify(c)} / db ${JSON.stringify(a)}`);
  }

  // C-05：raw／wiki 標題編號有效，index.md 與實際文件、實際來源引用一致
  const pages = markdownFiles(wikiDir).filter((f) => !notConceptPages.includes(f));
  const rawDocs = buildDocMap(raws.map((file) => ({ file, markdown: read(rawDir + file) })), 'R');
  const wikiDocs = buildDocMap(pages.map((file) => ({ file, markdown: read(wikiDir + file) })), 'W');
  const rawById = rawDocs.byId;
  const wikiById = wikiDocs.byId;
  const idProblems = [...rawDocs.problems, ...wikiDocs.problems];
  check('C-05 raw／wiki 標題編號有效且不重複', idProblems.length === 0, idProblems.join(' ⏎ '));
  const indexProblems = validateWikiIndex(read(wikiDir + 'index.md'), rawById, wikiById);
  check('C-05 index.md 目錄與實際文件、來源引用一致', indexProblems.length === 0, indexProblems.join(' ⏎ '));

  // C-03：每頁 wiki 的數字行都有來源標記，標記指到的 raw／W 頁真的存在
  for (const f of pages) {
    const md = read(wikiDir + f);
    const bad = untaggedNumberLines(md, wikiById);
    check(`C-03 ${f} 數字行皆有來源`, bad.length === 0, bad.join(' ⏎ '));
    const missing = [...invalidRawReferences(md, rawById), ...invalidWikiLinks(md, wikiById)];
    check(`C-03 ${f} 來源標記都指到存在的來源`, missing.length === 0, missing.join(' '));
  }

  // C-07：名詞定義有來源；〔推論〕寫出依據（沒有數字的句子 C-03 管不到）
  const glossaryBad = unsourcedGlossaryRows(read(wikiDir + 'glossary.md'));
  check('C-07 glossary.md 每個名詞都有來源', glossaryBad.length === 0, glossaryBad.join(' ⏎ '));
  for (const f of pages) {
    const bad = baselessInferences(read(wikiDir + f));
    check(`C-07 ${f} 的〔推論〕都寫出依據`, bad.length === 0, bad.join(' '));
  }

  // C-08：每頁概念頁都有討論紀錄（log.md 的 D 區段列出它）
  const logProblems = validateDiscussionLog(read(wikiDir + 'log.md'), wikiById);
  check('C-08 每頁概念頁都有討論紀錄', logProblems.length === 0, logProblems.join(' ⏎ '));

  // C-04：每張投影片都指到存在的 wiki 頁（編號與檔名要吻合）或文件
  const slidesHtml = read('slides/index.html');
  const sources = slideSources(slidesHtml);
  const citedFiles = new Set();
  sources.forEach((s, k) => {
    const refs = [...s.matchAll(/\b(W\d+)\s+([\w-]+\.md)/g)];
    refs.forEach(([, , file]) => citedFiles.add(file));
    const ok = refs.length ? refs.every(([, id, file]) => wikiById.get(id)?.file === file) : existsSync(new URL(s, root));
    check(`C-04 投影片 ${k + 1} → ${s}`, ok);
  });

  // C-06：簡報裡的每個百分比／秒數，都能在簡報引用的 wiki 頁找到（防止生成簡報時改掉或編出數字）
  const citedText = [...wikiById.values()].filter(({ file }) => citedFiles.has(file)).map(({ markdown }) => markdown).join('\n');
  for (const token of slideNumbers(slidesHtml)) {
    check(`C-06 簡報數字「${token}」出現在簡報引用的 wiki 頁`, citedText.includes(token));
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
