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

- `npm test`：36/36 通過，包含 v5→v6 等價遷移與複合 claim 不符時拒絕輸出、未查核 fact 不因同名頁升為來源、同語意多主張依 fact ID 保留各自證據、SQL position 傳播、icon registry 變更、匯出 JSON 與 `file://` bundle 等值、附魔來源稽核及效果關係呈現。
- `npm run build`：7 個分類、446 筆條目成功建置。靜態檢查 `dist/index.html`、schema v6 索引及詳情 JSON；無資料庫或遷移檔進入 `dist/`。未開瀏覽器。
- v5→v6 副本遷移：446 條目、1325 facts、286 組關聯、426 圖標；保留原 1320 筆 facts 與排序，另將 5 筆複合怪物效果拆成純效果 fact。舊資料只有未固定版本的怪物效果來源時，新增對應固定修訂來源列並保留舊來源列。SQLite integrity/FK 通過。附魔 profile 124 筆，內建附魔標記 117 筆。
- 來源驗證：移除「同名 Wiki 頁自動支持所有 facts」規則。初次 v6 遷移只把 11 筆已查核 claims 設為 `source`，其餘舊資料按 evidence 分類；後續 124 筆附魔雙側效果另見[逐筆來源稽核](../audits/enchantment-effect-facts.json)。
- 附魔逐筆稽核：253 個效果 facts 中 169 個有來源支持、83 個為推論、1 個未知；124 個效果關係中 7 個相同、12 個不同、105 個未知。每筆都有查核結果；沒有把查閱頁面缺少描述當成不可用。Wiki 修訂與支持摘錄收於稽核 JSON；無遊戲內實測。
- 來源修訂固定於稽核 JSON；新增建置工具可由 SQLite facts 與 source mapping 重建該紀錄，驗收確認每個 `source` fact 均有支持來源、原文摘錄和修訂號，且沒有未分類查核結果。
- 顯示驗收：Ambush 的怪物效果保留 `[verify]`，其玩家／怪物關係維持未知；Bonus Shot、Freezing、Radiance、Ricochet、Frenzied、Burning、Chilling、Rush、Tempo Theft、Chain Reaction、Multishot、Poison Cloud、Fuse Shot、Chains、Deflect、Echo 共 16 筆因來源資訊不足以比較完整效果，改列 unknown 並同層顯示雙側有來源支持的效果。Frenzied 怪物側 50% 數值維持可見。Critical Hit 顯示有來源支持的玩家與怪物效果差異。SQL position 修改同步至 JSON；未知附魔 profile 未推成同效或不可用。
- 審查修正：Leeching、Sharpness、Double Damage、Fast Attack、Quick 保留原複合 claim 與 fact ID 為 inference 並置於收合資訊；另拆 5 筆純效果 source facts，profile 指向新 facts。舊 claim 的效果句只作 context，不宣稱整句均有來源支持。8 筆可信度繁中標籤已與結構化等級同步。v5→v6 遷移保留 1320 筆舊 facts，另建立這 5 筆純效果 facts；未預置未經 fact-level audit 的 same/different 關係。
- 關係複審：再將 4 筆 same 與 7 筆 different 改為 unknown；Wiki 未明載的觸發機率、傷害間隔、持續時間或轉移機制不再用作相同／不同的證據。現在 same 7、different 12、unknown 105。
- 負向遷移驗收：複合效果原文與稽核映射不符時，測試確認遷移失敗、不留下部分輸出且不修改 v5 輸入。
- 匯出驗收：`dist` 有 7 分類、446 詳情 JSON、426 icon registrations；每個素材路徑存在；自包含 bundle 與 HTTP JSON 逐筆相同；無 SQLite 或 migration 檔案。
- SQLite 固有欄位控制 icon recipe；改動單一關聯標籤、疊圖比例或框樣式後，匯出值同步變更且驗證接受合法新值。
- 修正序列化循環：相關條目只輸出渲染需要的 ID、分類、名稱與圖標；JSON stringify 契約測試先失敗、修正後通過。
- 修正已知跨頁來源：回歸測試先發現 Ambush `mob_effect` 被錯誤歸給單品頁，改由既有內容盤點指向 Enchanted Mobs；並為 Ambush、Critical Hit、Freezing、Burning 的個別 facts 設定經查核的來源。遷移會核對 fact ID、英文標籤、值及來源頁，防止重複語意 facts 共用證據或舊證據套到改寫內容。
- 本次沒有打開本機網站或瀏覽器；建置產物與 `file://` bundle 靜態檢查通過，不代表實際瀏覽器渲染。
- Commit／push 狀態寫在 [ROADMAP 基線](../../ROADMAP.md#基線)。
