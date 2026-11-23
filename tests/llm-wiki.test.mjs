import test from 'node:test';
import assert from 'node:assert/strict';
import { overviewCounts, untaggedNumberLines, slideNumbers, unsourcedGlossaryRows, baselessInferences, run } from '../tools/check-llm-wiki.mjs';

test('overviewCounts 讀出概覽表的三欄數字', () => {
  assert.deepEqual(overviewCounts('| 近戰 | 83 | 1 | 7 | 〔R1〕 |\n| 類別 | 筆數 |'), { 近戰: { n: 83, unimpl: 1, seasonal: 7 } });
});

test('untaggedNumberLines 抓出沒有來源標記的數字行', () => {
  const md = '- 冷卻 30 秒\n- 冷卻 30 秒〔R4-3〕\n- 攻速 +100%〔推論〕\n一般段落 20% 不算';
  assert.deepEqual(untaggedNumberLines(md), ['- 冷卻 30 秒']);
});

test('slideNumbers 只取可見文字裡的百分比與秒數', () => {
  const html = '<style>.a{width:50%}</style><p>+33% 與 3 秒</p><script>x=10%</script>';
  assert.deepEqual(slideNumbers(html), ['+33%', '3 秒']);
});

test('unsourcedGlossaryRows 抓出沒有 〔R…〕 的名詞列，略過表頭與分隔列', () => {
  const md = '| 名詞 | 意思 | 來源 |\n|---|---|---|\n| 英雄 | 外觀 | |\n| 神器 | 主動道具 | 〔R4-1〕 |\n| 冷卻 | 要等多久 | |';
  assert.deepEqual(unsourcedGlossaryRows(md), ['| 英雄 | 外觀 | |', '| 冷卻 | 要等多久 | |']);
});

test('baselessInferences 只放行寫出依據的〔推論〕', () => {
  const md = 'A〔推論〕\nB〔推論，由 R2-2 推得〕\nC〔推論：一般常識〕';
  assert.deepEqual(baselessInferences(md), ['〔推論〕', '〔推論：一般常識〕']);
});

test('LLM Wiki 與簡報通過全部檢查節點', () => {
  const failed = run().filter((r) => !r.ok);
  assert.deepEqual(failed, []);
});

test('簡報圖示與標題字型內嵌，單獨開檔也顯示得出來', async () => {
  const { readFile } = await import('node:fs/promises');
  const html = await readFile(new URL('../slides/index.html', import.meta.url), 'utf8');
  const relative = html.match(/\.\.\/assets\/[^")\s]+/g) ?? [];
  assert.deepEqual(relative, ['../assets/fonts/noto-sans-tc.woff2']);
});
