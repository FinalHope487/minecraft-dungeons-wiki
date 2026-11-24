import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  overviewCounts, untaggedNumberLines, slideNumbers, unsourcedGlossaryRows, baselessInferences,
  buildDocMap, docId, rawFactIds, invalidRawReferences, invalidWikiLinks, collectRawReferences,
  expandRawIds, validateWikiIndex, validateDiscussionLog, run,
} from '../tools/check-llm-wiki.mjs';

const repo = new URL('../', import.meta.url);
const repoPath = (p) => fileURLToPath(new URL(p, repo));

const rawById = new Map([
  ['R4', { file: '04-artifact.md', factIds: [1, 3] }],
  ['R5', { file: '05-enchantment.md', factIds: [4, 5] }],
  ['R8', { file: '08-gameplay.md', factIds: [1, 11] }],
]);
const wikiById = new Map([
  ['W1', { file: 'overview.md', markdown: '# W1 · 概覽\n\n數量 3〔R8-1〕' }],
  ['W10', { file: 'new-topic.md', markdown: '# W10 · 新主題\n\n冷卻 30 秒〔R4-3〕' }],
]);

test('overviewCounts 讀出概覽表的三欄數字', () => {
  assert.deepEqual(overviewCounts('| 近戰 | 83 | 1 | 7 | 〔R1〕 |\n| 類別 | 筆數 |'), { 近戰: { n: 83, unimpl: 1, seasonal: 7 } });
});

test('untaggedNumberLines 段落、標題、表格的數字都要有來源', () => {
  assert.deepEqual(untaggedNumberLines('- 冷卻 30 秒\n- 冷卻 30 秒〔R4-3〕\n- 攻速 +100%〔推論，由 R2-2 推得〕'), ['- 冷卻 30 秒']);
  assert.deepEqual(untaggedNumberLines('一般段落 冷卻 30 秒 無來源'), ['一般段落 冷卻 30 秒 無來源']);
  assert.deepEqual(untaggedNumberLines('一般段落 20%〔R4-3〕'), []);
  assert.deepEqual(untaggedNumberLines('| 名 | 值 |\n|---|---|\n| 近戰 | 1 |'), ['| 近戰 | 1 |']);
  assert.deepEqual(untaggedNumberLines('## 共 83 件'), ['## 共 83 件']);
});

test('untaggedNumberLines 不把編號、清單序號、程式碼、網址當成事實數字', () => {
  const md = '# W10 · 新主題\n1. 第一步\n- 見 [W10](new-topic.md) 與 `R8-11`\n<https://minecraft.wiki/w/X?oldid=3786240>\n```\n冷卻 30 秒\n```\n檢查 C-03';
  assert.deepEqual(untaggedNumberLines(md), []);
});

test('untaggedNumberLines 的 W 連結要和檔名吻合才算來源', () => {
  assert.deepEqual(untaggedNumberLines('| 近戰 | 1 | [W10](new-topic.md) |', wikiById), []);
  assert.deepEqual(untaggedNumberLines('| 近戰 | 1 | [W10](overview.md) |', wikiById), ['| 近戰 | 1 | [W10](overview.md) |']);
  assert.deepEqual(invalidWikiLinks('見 [W10 新主題](new-topic.md#x) 與 [W1](new-topic.md)', wikiById), ['[W1](new-topic.md)']);
});

test('invalidRawReferences 抓出不存在的 raw、事實編號與推論依據', () => {
  assert.deepEqual(invalidRawReferences('冷卻 30 秒〔R99〕', rawById), ['R99']);
  assert.deepEqual(invalidRawReferences('冷卻 30 秒〔R8-999〕', rawById), ['R8-999']);
  assert.deepEqual(invalidRawReferences('〔R5 問題段〕與〔R5-4〕與〔來源未列出〕', rawById), []);
  assert.deepEqual(invalidRawReferences('沒有數字的句子〔R99〕', rawById), ['R99']);
  assert.deepEqual(invalidRawReferences('〔推論，由 R99 推得〕', rawById), ['R99']);
  assert.deepEqual(invalidRawReferences('〔推論，由 R5-4、R8-1、R77-2 推得〕', rawById), ['R77-2']);
  assert.deepEqual([...collectRawReferences('A〔R8-11〕 B〔推論，由 R5-4 推得〕 C 正文提到 R2')].sort(), ['R5', 'R8']);
});

test('rawFactIds 與 buildDocMap 讀 raw 的事實表並擋下重複與缺標題', () => {
  const raw = '# R9 · 測試\n\n## 抽出的事實\n\n| # | 事實 |\n|---|---|\n| 1 | a |\n| 2 | b |\n| 2 | c |\n\n## 其他\n\n| 7 | x |';
  assert.deepEqual(rawFactIds(raw), [1, 2, 2]);
  const { byId, problems } = buildDocMap([
    { file: '09.md', markdown: raw },
    { file: '10.md', markdown: '# R9 · 重複' },
    { file: '11.md', markdown: '沒有標題' },
  ], 'R');
  assert.deepEqual([...byId.keys()], ['R9']);
  assert.equal(problems.length, 3);
  assert.ok(problems.some((p) => p.includes('R9 的事實編號重複')));
  assert.ok(problems.some((p) => p.includes('R9 重複')));
  assert.ok(problems.some((p) => p.includes('11.md 缺少')));
  assert.deepEqual([...buildDocMap([{ file: 'a.md', markdown: '# W12 · 十二' }], 'W').byId.keys()], ['W12']);
});

const eightRaws = new Map(Array.from({ length: 8 }, (_, k) => [`R${k + 1}`, { file: `0${k + 1}.md`, factIds: [] }]));

test('expandRawIds 展開 index 的 raw 範圍', () => {
  assert.deepEqual([...expandRawIds('R1–R6 R8', eightRaws).ids], ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R8']);
  assert.deepEqual(expandRawIds('R5 R7', eightRaws).errors, []);
});

test('expandRawIds 拒絕極大、反向、含不存在 raw 的範圍與無法解析的文字，且立即結束', () => {
  const started = Date.now();
  assert.match(expandRawIds('R1–R3000000000000', eightRaws).errors.join(), /比 raw 總數 8 還長/);
  assert.match(expandRawIds('R1–R99999999999999999999', eightRaws).errors.join(), /必須是正整數/);
  assert.match(expandRawIds('R0', eightRaws).errors.join(), /必須是正整數/);
  assert.match(expandRawIds('R6–R3', eightRaws).errors.join(), /範圍反向/);
  assert.match(expandRawIds('R7–R9', eightRaws).errors.join(), /含不存在的 R9/);
  assert.match(expandRawIds('R1 見附註', eightRaws).errors.join(), /無法解析的內容「見附註」/);
  assert.ok(Date.now() - started < 1000);
});

test('來源標記只有一套語法：未閉合、行內程式碼、壞編號都不能當來源', () => {
  for (const line of ['冷卻 30 秒〔R99', '冷卻 30 秒 `〔R5〕`', '冷卻 30 秒〔R5-abc〕', '冷卻 30 秒〔R05〕', '冷卻 30 秒〔R5-0〕']) {
    assert.deepEqual(untaggedNumberLines(line), [line]);
  }
  assert.deepEqual(untaggedNumberLines('冷卻 30 秒〔R7 統計〕\n冷卻 30 秒〔R5 問題段〕\n冷卻 30 秒〔來源未列出〕'), []);
  assert.deepEqual(invalidRawReferences('冷卻 30 秒〔R99', rawById), ['格式錯誤 〔R99']);
  assert.deepEqual(invalidRawReferences('冷卻 30 秒〔R5-abc〕', rawById), ['格式錯誤 〔R5-abc〕']);
  assert.deepEqual(invalidRawReferences('〔推論，由 R5-abc 推得〕', rawById), ['格式錯誤 〔推論，由 R5-abc 推得〕']);
  assert.deepEqual(invalidRawReferences('行內程式碼 `〔R99〕` 不算標記', rawById), []);
  assert.deepEqual([...collectRawReferences('冷卻〔R5-abc〕 與 `〔R8〕`')], []);
});

test('validateWikiIndex 比對目錄列、連結與實際來源引用', () => {
  const index = [
    '## 原始來源（raw）', '', '| ID | 檔案 |', '|---|---|',
    '| R4 | [04-artifact.md](../raw/04-artifact.md) |', '| R5 | [05-enchantment.md](../raw/05-enchantment.md) |', '| R8 | [08-gameplay.md](../raw/08-gameplay.md) |', '',
    '## 概念頁（wiki）', '', '| ID | 頁面 | 一句話 | 用到的 raw |', '|---|---|---|---|',
    '| W1 | [overview.md](overview.md) | 概覽 | R8 |', '| W10 | [new-topic.md](new-topic.md) | 新主題 | R4 |', '',
    '## 簡報對照', '', '| W9 | 不在這裡檢查 |',
  ].join('\n');
  assert.deepEqual(validateWikiIndex(index, rawById, wikiById), []);
  assert.match(validateWikiIndex(index.replace(/^\| W10 .*\n/m, ''), rawById, wikiById).join('\n'), /W10 在 index 有 0 列/);
  assert.match(validateWikiIndex(index.replace(/^(\| W10 .*)$/m, '$1\n$1'), rawById, wikiById).join('\n'), /概念頁 W10 在 index 有 2 列/);
  assert.match(validateWikiIndex(`${index}\n| W9 | 簡報對照區段的列不算目錄 | |`, rawById, wikiById).join('\n'), /^$/);
  assert.match(validateWikiIndex(index.replace('| R4 |', '| R5 |'), rawById, wikiById).join('\n'), /在 index 有 2 列/);
  const wrongRaw = validateWikiIndex(index.replace('| 新主題 | R4 |', '| 新主題 | R5 |'), rawById, wikiById).join('\n');
  assert.match(wrongRaw, /W10 new-topic\.md.*index 缺少 R4.*index 多出 R5/);
  assert.match(validateWikiIndex(index.replace('(new-topic.md)', '(other.md)'), rawById, wikiById).join('\n'), /W10 的連結 other\.md 不是 new-topic\.md/);
});

test('validateWikiIndex 不依賴空白寫法，孤立列與壞的 raw 欄都擋下', () => {
  const index = '## 原始來源（raw）\n\n|ID|檔案|\n|---|---|\n|R4|[04-artifact.md](../raw/04-artifact.md)|\n|R5|[05-enchantment.md](../raw/05-enchantment.md)|\n|R8|[08-gameplay.md](../raw/08-gameplay.md)|\n\n'
    + '## 概念頁（wiki）\n\n|ID|頁面|一句話|用到的 raw|\n|---|---|---|---|\n|W1|[overview.md](overview.md)|概覽|R8|\n|W10|[new-topic.md](new-topic.md)|新主題|R4|\n';
  assert.deepEqual(validateWikiIndex(index, rawById, wikiById), []);
  assert.match(validateWikiIndex(`${index}|W99|[missing.md](missing.md)|測試|R1|\n`, rawById, wikiById).join('\n'), /W99.*沒有對應的檔案/);
  assert.match(validateWikiIndex(`${index}|X1|[x.md](x.md)|測試|R1|\n`, rawById, wikiById).join('\n'), /無法辨識編號的列：X1/);
  assert.match(validateWikiIndex(index.replace('|新主題|R4|', '|新主題|R1–R9999999999|'), rawById, wikiById).join('\n'), /W10 的「用到的 raw」欄：R1–R9999999999 範圍比 raw 總數 3 還長/);
});

test('docId 只認正整數編號', () => {
  assert.equal(docId('# W10 · 新主題', 'W'), 'W10');
  for (const title of ['# W0 · x', '# W01 · x', '# W99999999999999999999 · x', '# W · x', '## W1 · x']) assert.equal(docId(title, 'W'), null);
});

test('validateDiscussionLog 每頁概念頁都要被 D 紀錄列出，I／G 紀錄不算', () => {
  const d = (pages) => `### D-01 · 討論\n\n- **受眾**：新手\n- **核心問題**：怎麼看\n- **範圍**：裝備\n- **涉及概念頁**：${pages}\n\n`;
  assert.deepEqual(validateDiscussionLog(d('W1 W10'), wikiById), []);
  assert.match(validateDiscussionLog(`${d('W1')}### G-01 · 生成\n\n生成 W10。`, wikiById).join('\n'), /W10 new-topic\.md 沒有被任何 D/);
  assert.match(validateDiscussionLog(d('W1 W10 W99'), wikiById).join('\n'), /W99 沒有對應的概念頁/);
  assert.match(validateDiscussionLog(d('W1 W10').replace('- **範圍**：裝備\n', ''), wikiById).join('\n'), /缺少「範圍」/);
  assert.match(validateDiscussionLog(`${d('W1')}${d('W10')}`, wikiById).join('\n'), /D-01 重複/);
});

test('validateDiscussionLog 空欄位不能被下一行填滿，示範用 D 紀錄與壞的標題、項目不算數', () => {
  const log = (extra = '', pages = 'W1 W10') => `### D-03 · 討論\n\n- **受眾**：${extra}\n- **核心問題**：怎麼看裝備\n- **範圍**：附魔\n- **涉及概念頁**：${pages}\n`;
  assert.deepEqual(validateDiscussionLog(log('新手'), wikiById), []);
  assert.match(validateDiscussionLog(log(''), wikiById).join('\n'), /D-03 缺少「受眾」/);
  assert.match(validateDiscussionLog(log('新手').replace('D-03 · ', 'D-03abc · '), wikiById).join('\n'), /W1 overview\.md 沒有被任何 D/);
  assert.match(validateDiscussionLog(log('新手', 'W1 W10 W1x'), wikiById).join('\n'), /無法辨識的項目：W1x/);
  assert.match(validateDiscussionLog(`\`\`\`\n${log('新手')}\`\`\``, wikiById).join('\n'), /W10 new-topic\.md 沒有被任何 D/);
});

test('slideNumbers 只取可見文字裡的百分比與秒數', () => {
  const html = '<style>.a{width:50%}</style><p>+33% 與 3 秒</p><script>x=10%</script>';
  assert.deepEqual(slideNumbers(html), ['+33%', '3 秒']);
});

test('unsourcedGlossaryRows 抓出沒有 〔R…〕 的名詞列，略過表頭與分隔列', () => {
  const md = '| 名詞 | 意思 | 來源 |\n|---|---|---|\n| 英雄 | 外觀 | |\n| 神器 | 主動道具 | 〔R4-1〕 |\n| 冷卻 | 要等多久 | |';
  assert.deepEqual(unsourcedGlossaryRows(md), ['| 英雄 | 外觀 | |', '| 冷卻 | 要等多久 | |']);
  const twoTables = '| a | s |\n|:---|---|\n| x | 〔R1〕 |\n\n| h | s |\n|---|---|\n| y | |';
  assert.deepEqual(unsourcedGlossaryRows(twoTables), ['| y | |']);
});

test('baselessInferences 只放行寫出依據的〔推論〕', () => {
  const md = 'A〔推論〕\nB〔推論，由 R2-2 推得〕\nC〔推論：一般常識〕';
  assert.deepEqual(baselessInferences(md), ['〔推論〕', '〔推論：一般常識〕']);
});

test('LLM Wiki 與簡報通過全部檢查節點', () => {
  const failed = run().filter((r) => !r.ok);
  assert.deepEqual(failed, []);
});

// 在暫存工作區複製現有知識庫，新增一頁 W10（有 raw 來源、index 列、D 紀錄），再依案例破壞一處。
function checkNewPage({ page = '# W10 · 新主題\n\n這一頁只用來驗證新增流程。冷卻 30 秒。〔R4-3〕\n', indexRaws = 'R4', index = true, log = true, mutate } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'llm-wiki-check-'));
  try {
    cpSync(repoPath('llm-wiki'), join(dir, 'llm-wiki'), { recursive: true });
    cpSync(repoPath('slides'), join(dir, 'slides'), { recursive: true });
    mkdirSync(join(dir, 'content'));
    cpSync(repoPath('content/catalog.sqlite'), join(dir, 'content/catalog.sqlite'));
    mkdirSync(join(dir, 'docs'));
    cpSync(repoPath('docs/llm-wiki-workflow.md'), join(dir, 'docs/llm-wiki-workflow.md'));
    const wiki = (name) => join(dir, 'llm-wiki/wiki', name);
    writeFileSync(wiki('new-topic.md'), page);
    if (index) {
      writeFileSync(wiki('index.md'), readFileSync(wiki('index.md'), 'utf8')
        .replace(/^(\| W7 \|.*)$/m, `$1\n| W10 | [new-topic.md](new-topic.md) | 新主題 | ${indexRaws} |`));
    }
    if (log) {
      const text = readFileSync(wiki('log.md'), 'utf8');
      writeFileSync(wiki('log.md'), `${text}\n## 第三次執行（測試）\n\n### D-03 · 討論：新主題\n\n- **受眾**：新手\n- **核心問題**：怎麼新增\n- **範圍**：測試\n- **涉及概念頁**：W10\n`);
    }
    mutate?.(dir);
    return run(dir).filter((r) => !r.ok).map((r) => r.name);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// 來源標記指到不存在的 raw 時，index 宣告的 raw 也不會等於頁面實際引用，所以 C-05 會一起失敗。
const indexMismatch = 'C-05 index.md 目錄與實際文件、來源引用一致';
const onlyChecks = (names, prefix) => names.length > 0 && names.every((n) => n.startsWith(prefix));

test('新增 W10：有來源、index、D 紀錄、不改簡報就全部通過', () => {
  assert.deepEqual(checkNewPage(), []);
});

test('新增 W10：缺 index 列、缺 D 紀錄各自被 C-05、C-08 擋下', () => {
  assert.ok(onlyChecks(checkNewPage({ index: false }), 'C-05'));
  assert.ok(onlyChecks(checkNewPage({ log: false }), 'C-08'));
});

test('新增 W10：不存在的 raw 與沒有來源的數字被 C-03 擋下', () => {
  const unresolved = 'C-03 new-topic.md 來源標記都指到存在的來源';
  const badRaw = checkNewPage({ page: '# W10 · 新主題\n\n冷卻 30 秒〔R4-3〕。另一句〔R99-1〕。\n' });
  assert.deepEqual(badRaw.sort(), [unresolved, indexMismatch]);
  const badInference = checkNewPage({ page: '# W10 · 新主題\n\n冷卻〔R4-3〕。推論〔推論，由 R99 推得〕\n' });
  assert.deepEqual(badInference.sort(), [unresolved, indexMismatch]);
  const malformed = checkNewPage({ page: '# W10 · 新主題\n\n冷卻 30 秒〔R4-3〕。另一句〔R4-abc〕。\n' });
  assert.deepEqual(malformed, [unresolved]);
  const paragraph = checkNewPage({ page: '# W10 · 新主題\n\n這一頁寫了冷卻 30 秒，沒有來源。〔R4〕\n\n攻速加快 20%，也沒有來源。\n' });
  assert.deepEqual(paragraph, ['C-03 new-topic.md 數字行皆有來源']);
});

test('新增 W10：index 宣告的 raw 與實際引用不同被 C-05 擋下', () => {
  assert.ok(onlyChecks(checkNewPage({ indexRaws: 'R5' }), 'C-05'));
});

test('新增 W10：簡報引用錯誤檔名被 C-04 擋下', () => {
  const failed = checkNewPage({
    mutate: (dir) => {
      const file = join(dir, 'slides/index.html');
      writeFileSync(file, readFileSync(file, 'utf8').replace('data-src="W1 overview.md"', 'data-src="W10 overview.md"'));
    },
  });
  assert.ok(onlyChecks(failed, 'C-04'));
});

test('新增 W10：簡報的數字只存在於沒被簡報引用的 W10 時，被 C-06 擋下', () => {
  const failed = checkNewPage({
    page: '# W10 · 新主題\n\n冷卻 99 秒。〔R4-3〕\n',
    mutate: (dir) => {
      const file = join(dir, 'slides/index.html');
      writeFileSync(file, readFileSync(file, 'utf8').replace('</body>', '<p>冷卻 99 秒</p></body>'));
    },
  });
  assert.ok(onlyChecks(failed, 'C-06'));
});

test('簡報圖示與標題字型內嵌，單獨開檔也顯示得出來', async () => {
  const { readFile } = await import('node:fs/promises');
  const html = await readFile(new URL('../slides/index.html', import.meta.url), 'utf8');
  const relative = html.match(/\.\.\/assets\/[^")\s]+/g) ?? [];
  assert.deepEqual(relative, ['../assets/fonts/noto-sans-tc.woff2']);
});
