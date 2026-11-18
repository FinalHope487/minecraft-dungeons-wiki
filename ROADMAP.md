# Roadmap

制定在建立目標時不可跨越的準則寫在〈硬約束〉。
commit 與 CI run 的 SHA 與狀態寫在〈基線〉。
新想法寫進〈待辦項目〉並標記，不打斷目前任務。已完成的待辦刪除。詳見 docs/spec.md 的現行規格。

此檔不准自己寫新欄位，不准寫已拍板的決策（寫 `docs/decisions/`）。

- `[now]` — 阻塞當前任務
- `[next]` — 目前模組穩定後就做
- `[blocked]` — 需要 user 先拍板，見 `QUESTIONS.md`
- `[later]` — 現在做屬於過早設計，等需求明確再說
- `[parked]` — 先記錄，暫不評估

這五個以外的標籤不准用。

`[later]` 條目寫在 `ROADMAP/later.md`，`[parked]` 寫在 `ROADMAP/parked.md`，其餘留在本檔〈待辦項目〉。狀態改了就把條目搬到對應的檔。

格式如下:

### [狀態] {一句話描述}
**具體細節**：{描述問題狀態}
**怎麼做**：{寫已知的短計畫，或連到 docs/plans/ 下的獨立計畫}
**會改變什麼**：{明確做了這件事會改到什麼}
**做後回退代價**：{假設這件事做完了，要改回來得額外做什麼——`git revert` 哪個 commit、哪些資料或產出要另外清、有沒有東西回不來。「還沒做所以是零」不算答案}

範例如下:

### [next] 高負載時介面頓不頓，只有人工才測得出來
**具體細節**：2026-xx-xx 已驗證三個背景工作同時跑不逾時（N passed），手感部分 user 還沒實際操作過
**怎麼做**：在背景工作執行期間手動觀察介面的響應時間
**會改變什麼**：確認頓的話要把並行上限設定調成 1；這一步無法自動化，需要 user 實際操作時觀察
**做後回退代價**：結論若是要把並行上限設成 1，回退就是把它改回原值，一行設定；沒有資料或產出受影響

---

## 硬約束

不管在做什麼，這些不能跨過。每條 ≤2 行，且必須寫明誰在強制它。

<!-- - **<一句話規則>** **強制**：<測試名／哨兵／程序>
     長說明放 `SOP/` 或 `docs/decisions/`，不要寫在這裡 -->

---

## 基線

**只有一份，覆寫不追加，≤40 行。** 數字取自本輪實跑；沒跑的層寫「未跑」，
不得沿用上一輪的數字。

**commit**：`f3af2e23ab3de189e1a0c9fa2004286dee896ec9`（附魔改寫與驗收提交）
**CI run**：未跑

| 層 | 指令 | 2026-11-18 實跑 |
| --- | --- | --- |
| 內層 | `npm test` | 47/47 通過 |
| 建置 | `npm run build` | 7 個分類、446 個條目 |
| user 層 | 靜態檢查 `dist` 的條目 JSON 與 file bundle | 446/446 條目及 506/506 個雙語效果欄位相同，未開瀏覽器 |
| 公開 | GitHub Pages | 未跑 |
| 文件 | 核對附魔稽核資料、計畫與 `git diff --check` | 124/124 附魔、253/253 effects 有逐筆紀錄；SQLite integrity `ok`、foreign key violations 0 |

---

## 待辦項目

<!-- 條目照本檔開頭的格式。做完的直接刪掉，不留「已完成」條目。 -->

### [now] 建立可公開驗收的 Wiki 首版

**具體細節**：神器、消耗品與其他物品已有條目；47 筆通用佔位說明已替換為 Wiki 原文或有來源的已知資訊，未記載效果者標明未知。124 個附魔及 228 件近戰、遠程與盔甲已按 Wiki 名錄收錄；附魔逐條區分英雄／怪物可用性與效果，條目可信度為 high 39、medium 76、low 9；低可信條目及衝突見[附魔玩家與怪物效用規格](docs/specs/enchantment-availability.md)及[來源稽核](docs/audits/enchantment-effect-facts.json)。近戰 Sword 系列已排在 Spear 後、Tempest Knife 前，遠程與盔甲順序已核對。45 件已實裝神器原文已逐項核對並修正 7 筆。`file://` 本機入口已依[啟動修正計畫](docs/plans/2026-11-17-file-url-bootstrap.md)補上 classic 啟動路徑與自包含資料包。資料來源已結構化至 SQLite v6，執行結果見[結構化資料計畫](docs/plans/2026-11-18-structured-catalog-v6.md)。GitHub 登入與公開素材使用條件尚待確認。
**怎麼做**：SQLite v6 schema、呈現政策與匯出契約已依[結構化資料計畫](docs/plans/2026-11-18-structured-catalog-v6.md)完成並驗收；接著依[Wiki 首版計畫](docs/plans/2026-11-15-wiki-launch.md)核對公開素材使用條件。Wiki 內容缺漏及收錄優先序見[盤點紀錄](docs/content-coverage-audit.md)，附魔來源與呈現見[詳情規格](docs/specs/detail-presentation.md)及[附魔效用規格](docs/specs/enchantment-availability.md)。GitHub CLI 登入與 remote 就緒後，發布並實測。
附魔雙語文案依[Luna 改寫計畫](docs/plans/2026-11-18-enchantment-effect-rewrite.md)逐項查核完成（11 批、124 個附魔、253 筆 effects）；Multishot 的玩家／怪物效果關係仍待固定版次確認，詳見[逐批進度稽核](docs/audits/enchantment-effect-rewrite-progress.json)。
附魔詳情的 Wiki 原文區仍從改寫後的 fact 值取文案；38 筆 facts（37 個附魔）與來源摘錄不同，受影響條目和下一步見[改寫計畫](docs/plans/2026-11-18-enchantment-effect-rewrite.md)。
**會改變什麼**：公開圖鑑涵蓋 Wiki 列出的附魔、武器與盔甲，並能顯示稀有度、實裝與 Seasonal 標籤；SQLite v6 將內容語意、效果判讀、關聯和圖標規則集中至固定欄位，由匯出政策同步兩種版型。
**做後回退代價**：擴充分階段提交。若要撤回，回退相關擴充提交並重新部署已驗證的首版，再核對公開連結。
