# LLM Wiki · Minecraft Dungeons 裝備與附魔

一份由 LLM 維護的知識庫，主題是《Minecraft Dungeons》一代的**裝備系統**：近戰、遠程、盔甲、神器、消耗品和附魔，以及「同一個附魔用在玩家和怪物身上效果不一樣」這類容易搞錯的地方。

它是 [教學簡報](../slides/index.html) 唯一的知識來源。簡報每一頁都標了引用哪一頁 Wiki，對照表見 [wiki/index.md](wiki/index.md#簡報對照)。

## 結構

| 路徑 | 放什麼 | 誰寫 |
|---|---|---|
| [`raw/`](raw/) | 原始來源摘錄：每篇一個檔，記 URL、固定修訂號、抽出來的事實與數字 | LLM ingest，人工核對 |
| [`wiki/`](wiki/) | 概念頁：用自己的話整理、互相連結，每個事實標出 raw 來源 | LLM 生成，經檢查節點才能寫入 |
| [`wiki/index.md`](wiki/index.md) | 全部頁面的目錄＋簡報對照表 | LLM 每次寫入後更新 |
| [`wiki/log.md`](wiki/log.md) | 討論紀錄、ingest 紀錄、檢查紀錄（時間序） | LLM 逐次追加 |

## 寫入規則（schema）

1. **先討論、後生成**：每次 ingest 前先在 `log.md` 寫下這次要回答的問題、範圍與受眾，確認後才生成頁面。
2. 每個數字或效果描述後面標來源，例如 `〔R5〕`＝[raw/05-enchantment.md](raw/05-enchantment.md)。沒有直接來源的句子要標 `〔推論，由 R… 推得〕`，寫出從哪幾篇推得；名詞表每個定義都要有 `〔R…〕`（C-07 檢查）。
3. 來源互相矛盾時不選邊，兩邊都寫，並標 `⚠ 衝突`。
4. 「查不到」不等於「不存在」：Wiki 沒寫的就寫「來源未列出」。
5. 不混入《Minecraft Dungeons II》或 Minecraft 本傳的資料。
6. 數字一律和 repo 已驗收的資料（`content/catalog.sqlite`、`tests/fixtures/`、`docs/audits/`）交叉核對，對不上就退回重寫。
7. 新增概念頁不必新增投影片，但要做到：標題用 `# W<編號> · 名稱`；每個含數字的行都有同一行的來源標記（`〔R…〕`、`〔推論，由 R… 推得〕`、`〔來源未列出〕`，或指到其他 W 頁的連結），標記不能寫壞（未閉合、`〔R5-abc〕`、放在行內程式碼裡都算失敗），標的 raw 與事實編號要真的存在（C-03）；`index.md` 的 W 列與「用到的 raw」和頁面實際引用一致（C-05）；`log.md` 有一筆 D 紀錄在 `**涉及概念頁**` 列出它，並寫明受眾、核心問題、範圍（C-08）。

整個流程（loop／graph）、實跑紀錄與反思見 [`docs/llm-wiki-workflow.md`](../docs/llm-wiki-workflow.md)。
