# LLM Wiki 紀錄

時間序紀錄。D＝討論、I＝ingest、C＝檢查、G＝生成。

## 前置（2026-11-15 ～ 11-18，圖鑑網站階段）

這段是本 repo 圖鑑網站的開發紀錄，LLM Wiki 的 raw 資料就是從這裡驗收過的成果萃取出來的。證據在 `docs/plans/`、`docs/decisions/`、`docs/audits/`。

| 日期 | 類型 | 內容 | 證據 |
|---|---|---|---|
| 11-15 | D | 先和 ChatGPT 討論範圍與規格，再實作：只收一代、以 Wiki 總表為入口、逐項查項目頁 | `docs/plans/2026-11-15-wiki-launch.md`、`agents-with-chatgpt-involvement.md` |
| 11-17 | C | 裝備數字對不上：頁首寫 224，具名清單 228 → 決定以具名清單計數 | `docs/decisions/2026-11-17-gear-roster-counts.md` |
| 11-17 | C | 神器頁首寫 46，表格只有 45 → 以表格為準 | `docs/sources.md` |
| 11-17 | C | 重新逐頁比對，修正 7 筆神器英文描述 | commit `fix(catalog): match artifact text to wiki` |
| 11-17 | D | 使用者指出 Critical Hit 玩家／怪物機率不同 → 決定 124 筆附魔全部分兩側記錄 | `docs/decisions/2026-11-17-enchantment-audience-effects.md` |
| 11-18 | C | 253 條附魔效果逐筆稽核：來源／推論／可信度；找到 2 筆來源衝突 | `docs/audits/enchantment-effect-facts.json` |

## 本次執行（2026-11-23，LLM Wiki ＋ 簡報）

### D-01 · 先討論：要回答什麼問題？

- **受眾**：沒玩過 Minecraft Dungeons 的同學。
- **核心問題**：「拿到一件裝備，要怎麼看懂它？」
- **範圍**：只講裝備系統（裝備種類、稀有度、附魔、神器／消耗品）。不講關卡、劇情、Boss。
- **必須講的坑**：同名附魔在怪物身上效果不同（Critical Hit）。這是前置階段使用者自己發現的問題，也是最有教學價值的一點。
- **來源選擇**：7 篇 Minecraft Wiki 總表頁，每篇都有 repo 已驗收的資料可以交叉核對。
- 決定者：Claude 提出大綱，使用者同意後才開始生成。

### I-01 · Ingest 7 篇來源

R1–R7 寫入 `raw/`。每篇抽出事實表，「核對」欄對照 `content/catalog.sqlite`、`tests/fixtures/`、`docs/audits/`。

### G-01 · 生成 W1–W7

依 D-01 大綱生成 7 頁概念頁，每個事實標 `〔R…〕` 或 `〔推論〕`。

### G-02 · 查 Wiki 生成簡報

17 張投影片，每張的 `data-src` 寫出引用的 W 頁。

### C-run-1 · 第一次跑 `node tools/check-llm-wiki.mjs`：42／46 通過

| 失敗項 | 原因 | 處理 |
|---|---|---|
| C-03 artifacts-and-consumables.md | 「冷卻 30 秒」「攻速 +100%」兩行沒標來源 | 補 〔R4-3〕 |
| C-03 equipment-types.md | 對照表裡 Hunter's Armor 的 +30% 沒標來源 | 補 〔R3-2〕〔R5-4〕 |
| C-03 player-vs-mob.md | Electrified 的 5 秒／4 秒衝突列沒標來源 | 補 〔R5〕 |
| C-04 投影片 17 | 指向的 `docs/llm-wiki-workflow.md` 還沒寫 | 預期中，寫完即通過 |

**觀察**：三個 C-03 失敗都出在**生成 Wiki 頁**這個節點。LLM 把 raw 的數字改寫成條列或表格時，來源標記被丟掉了。數字本身沒錯，但讀者無法追溯。

### C-run-1b · 加新檢查 C-06

第一輪的檢查只會確認「投影片有指到 Wiki 頁」，不會確認「投影片上的數字 Wiki 裡真的有」。加上 C-06：從簡報抽出所有 `%`／`秒` 數字，逐一在 Wiki 裡搜尋。

### C-run-2 · 修正後重跑：60／61 通過

剩下唯一失敗是 C-04 投影片 17（workflow 文件未寫）。C-06 的 15 個數字全部能在 Wiki 找到。

### C-run-3 · workflow 文件完成後重跑

結果見 [docs/llm-wiki-workflow.md](../../docs/llm-wiki-workflow.md#實際執行紀錄)。

## 第二次執行（2026-11-24，補來源）

### D-02 · 討論：簡報的內容都從 Wiki 來嗎？

- 使用者問：作業是否要求簡報資訊都從 Wiki 整理而來？原始來源（Minecraft Wiki 總表）只列遊戲資料，沒有解釋名詞、背景的頁面。
- 人工稽核結果：簡報的事實都對得到 LLM Wiki，但 Wiki 本身有 7 處〔推論〕沒有 raw 來源（遊戲類型、「沒有職業」、裝備欄 6 格等），W7 名詞表 13 個定義全都沒標來源。
- 決定：補一篇講遊戲本身的來源，再回頭改 W1、W5、W7。使用者同意後才動手。

### C-run-4 · 舊檢查全過，但漏掉這個問題

舊版 62 項檢查（含 R8 的 C-01）全部通過。原因是 C-03 只檢查**含數字**的行；名詞定義與背景說明沒有數字，直接漏過。

### I-02 · Ingest R8

[raw/08-gameplay.md](../raw/08-gameplay.md)：Minecraft Dungeons 主條目（oldid 3909743）＋ Dungeons:Gameplay（oldid 3402528），抽出 14 條事實。ingest 時發現：

- 裝備欄格數只寫在 Gameplay 子頁，主條目沒有，所以兩頁一起收。
- 原 W1 與簡報第 3 頁的「俯視角」「沒有合成」兩頁來源都沒寫 → 刪掉。
- 附魔點數、3 欄 × 3 選 1 的啟用方式原本 Wiki 沒寫 → 補進 W4、W7。

### G-03 · 改寫 W1、W4、W5、W7 與簡報第 3 頁

- W1：遊戲類型、不限職業、不能建造挖礦、裝備欄改標 〔R8-…〕。「裝備就是你的職業」是教學用的歸納，保留〔推論〕並寫出依據。
- W7 名詞表加「來源」欄，新增英雄、裝備欄、附魔點數、消耗品 4 個名詞。

### C-run-5 · 新增 C-07

C-07：名詞表每列要有 〔R…〕；每個〔推論〕要寫出「由 R… 推得」。拿舊版 Wiki 跑：名詞表 13 列無來源、〔推論〕無依據 5 處，全部會被擋下。

### C-run-6 · 重跑：70／70 通過
