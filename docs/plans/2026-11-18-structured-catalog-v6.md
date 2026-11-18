# 結構化圖鑑資料與呈現 v6

## 目標與狀態

**狀態**：進行中。

以 SQLite v6 保存可查證的條目語意、事實與判讀、附魔雙側效果、圖標與關聯；由單一建置期純函式產生 HTTP 與 `file://` 共用的詳情展示模型。

驗收依據：[專案規格](../spec.md)、[條目契約](../specs/content-contract.md)、[靜態目錄](../specs/catalog-storage.md)、[詳情呈現](../specs/detail-presentation.md)及本計畫的驗收條件。

## 改動邊界

- 資料：`content/schema.sql`、`content/catalog.sqlite`、`content/migrations/`。
- 匯出與素材：`tools/catalog.mjs`、`tools/build.mjs`、`tools/file-app.mjs`、`tools/sync-wiki-icons.mjs`、`src/icon-assets.mjs`。
- 展示：`src/detail-policy.mjs`、`src/wiki.js`、`src/wiki.css`、`src/locale.mjs`。
- 驗收：`tests/`、相關 `docs/specs/`、`docs/spec.md`、`docs/project-rules.md`、`docs/decisions/`。

保留所有公開條目 ID、內容翻譯、原始 facts、traits、links、sources 及其順序，並保留 117 筆內建附魔的 `property_trait_id`、Bullet 類型與階級。HTTP 與 `file://` 均使用 schema v6 JSON。呈現政策不寫入 SQL，圖標 recipe 的資料值寫入 SQL。

## 步驟與驗證

1. 建立 v5 匯出快照與副本遷移驗收；遷移失敗不得改動正式資料庫。
2. v6 facts 加入 `semantic_key`、`claim_origin`、`wiki_status`；同一條目可保存同語意的多筆主張，以 `position` 排序。未知語意或來源性質不得推測；source 主張須有 `supports` 證據，context 不得冒充支持，並保留來源衝突。
3. 為附魔建立結構化玩家／怪物可用性、效果 fact 參照與效果關係。未經來源及現有稽核資料證實者使用 `unknown`。
4. 為關聯加入穩定種類；僅在不改既有條目順序與輸出時衍生反向展示。
5. 將 icon id、檔案、種類、已知 Wiki 來源與 icon composition recipe 正規化至 SQLite。Recipe 初始比例採使用者指定的 81%，框樣式和比例均由資料庫控制；缺來源標 `unknown`。
6. `tools/catalog.mjs` 驗證資料並呼叫 `src/detail-policy.mjs`，依 SQLite `position` 生成展示 JSON。來源支持的效果關係未知時仍顯示雙側文字並標示未確認；`src/wiki.js` 不依英文標籤、英文句首或 enchantment ID 推導語意。
7. 同步升級 schemaVersion 檢查，讓 HTTP 和 `file://` 使用同一展示資料與 icon registry。
8. 更新舊版規格矛盾；執行 `npm test`、`npm run build`，檢查本地 `dist/` 的 JSON、JS、CSS、圖標及無 DB/遷移檔條件；不開瀏覽器。

驗收不變量：遷移前後所有條目、翻譯、facts、traits、links、sources 與順序一致；SQLite integrity 與 FK 檢查通過；每筆 source 主張有 supports 證據；同語意多筆主張可保存並按 SQL `position` 顯示；附魔效果依結構欄位決定顯示，同效不重複全文、不同效果同層、未知保留來源文字並標示未確認；主資訊 → 相關條目 → 預設收合更多資訊 → 來源；HTTP 與 `file://` 共用 schema v6；圖標疊圖僅有一個 81% 設定點。

## 切換與回退

v5→v6 遷移先套用於工作區副本。正式 `content/catalog.sqlite` 僅在副本驗證、欄位回填及資料等價檢查均通過後更新。Git 中的 v5 檔案可作回復來源；回退 v6 commit 後，需重新建置靜態 JSON。

## 執行結果

- `npm test`：32/32 通過，包含 v5→v6 等價遷移、未查核 fact 不因同名頁升為來源、同語意多主張依 fact ID 保留各自證據、SQL position 傳播、icon registry 變更、匯出 JSON 與 `file://` bundle 等值及全名錄驗收。
- `npm run build`：7 個分類、446 筆條目成功建置。靜態檢查 `dist/index.html`、schema v6 索引及詳情 JSON；無資料庫或遷移檔進入 `dist/`。未開瀏覽器。
- v5→v6 副本遷移：446 條目、1320 facts、286 組關聯、426 圖標；SQLite integrity/FK 通過，保留全部舊欄位與排序。附魔 profile 124 筆，內建附魔標記 117 筆。
- 來源驗證：移除「同名 Wiki 頁自動支持所有 facts」規則。12 筆逐項列在 migration 的 fact-ID 對應表，其中 11 筆為已查核來源主張、1 筆為 Ambush 可用性跨頁整理；共有 11 筆 `source`、397 筆 `inference`、912 筆 `unknown`。其餘來源只標 `context`；未分類英文標籤遷移為 `semantic_key='unknown'` 及 `claim_origin='unknown'`。124 筆附魔的 248 個效果 facts 中，目前 8 筆有逐項核實的支持來源，其他未核實內容仍保留於「更多資訊」。後續逐筆查核列在 ROADMAP。
- 顯示驗收：Ambush 的已標 `[verify]` 怪物效果與可用性未確認標記都留在主欄；Freezing 的雙側效果同層顯示並附關係未確認；SQL position 修改同步至 JSON；未知附魔 profile 未推成同效或不可用。
- 匯出驗收：`dist` 有 7 分類、446 詳情 JSON、426 icon registrations；每個素材路徑存在；自包含 bundle 與 HTTP JSON 逐筆相同；無 SQLite 或 migration 檔案。
- SQLite 固有欄位控制 icon recipe；改動單一關聯標籤、疊圖比例或框樣式後，匯出值同步變更且驗證接受合法新值。
- 修正序列化循環：相關條目只輸出渲染需要的 ID、分類、名稱與圖標；JSON stringify 契約測試先失敗、修正後通過。
- 修正已知跨頁來源：回歸測試先發現 Ambush `mob_effect` 被錯誤歸給單品頁，改由既有內容盤點指向 Enchanted Mobs；並為 Ambush、Critical Hit、Freezing、Burning 的個別 facts 設定經查核的來源。遷移會核對 fact ID、英文標籤、值及來源頁，防止重複語意 facts 共用證據或舊證據套到改寫內容。
- 本次沒有打開本機網站或瀏覽器；建置產物與 `file://` bundle 靜態檢查通過，不代表實際瀏覽器渲染。
- Commit／push 狀態寫在 [ROADMAP 基線](../../ROADMAP.md#基線)。
