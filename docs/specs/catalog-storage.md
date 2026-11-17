# SQLite 圖鑑資料庫規範

## 執行邊界

- `content/catalog.sqlite` 是唯一可編輯的圖鑑資料來源。
- SQLite 僅供本機內容編輯與 Node 建置工具讀取。GitHub Pages 只發布靜態 JSON 和圖片，不提供資料寫入或資料庫服務。
- HTTP 網頁先載入 `data/catalog-index.json`；選取條目時才載入 `data/entries/<id>.json`。`file://` 開啟建置產物時使用由相同 JSON 產生的自包含 classic bundle，避免本機檔案來源限制模組載入與 `fetch`。瀏覽器不讀 SQLite，也不呼叫外部資料服務。
- 列表、分類及關聯圖片設定原生 `loading="lazy"`；選取中條目的主圖優先載入。
- 建置只複製允許發布的靜態檔案。SQLite、schema、建置工具不得進入 `dist/`。

## 相容環境與 Schema

- 建置工具使用 Node 內建 `node:sqlite`；最低 Node 版本由 [package.json](../../package.json) 的 `engines.node` 定義。
- Schema 以 [content/schema.sql](../../content/schema.sql) 為準，版本存於 `PRAGMA user_version`。建置只接受支援的版本；遷移時同步更新 schema 與匯出程式。
- Schema v2 在條目列新增 `implemented` 布林欄位；匯出的 JSON `schemaVersion` 同步為 2。舊資料預設為已實裝。
- Schema v3 在條目列新增 `seasonal` 布林欄位，預設為 `false`；匯出的索引摘要及條目 JSON 同步提供此欄位並使用 `schemaVersion` 3。
- Schema v4 新增 `entry_built_in_enchantments` 關聯中繼資料表，記錄 Bullet 圖標及可空的附魔階級；遷移 SQL 見 [v3→v4](../../content/migrations/v3-to-v4-built-in-enchantment-markers.sql)。HTTP JSON 與 `file://` bundle 的 `schemaVersion` 同步為 4。
- 建置啟用並檢查外鍵。資料採 UTF-8；翻譯欄位按語言分列，必須提供非空白的繁中與英文。新增語言需同步更新 locale、資料庫驗證及前端契約。

## 資料約束

- ID 使用 `^[a-z][a-z0-9-]*$`，全表唯一；發布後不得重用已公開 ID，以維持分享網址。
- 每筆條目必須屬於既存分類，分類和條目均須有圖示。
- `implemented` 僅接受布林值；SQLite 使用 `0`／`1`，新增既有資料列預設為 `1`。
- 分類群組為空值或 `equipment`；`equipment` 的條目納入「全部裝備」。
- 每筆條目至少有一個 HTTPS 來源；所有關聯目標必須存在。
- 展示順序依 `position`，從 0 起算。分類與條目各有全站唯一順序；屬性、特性、關聯與來源在各自父項內排序。
- 建置驗證外鍵、資料庫完整性、必要翻譯、ID、分類關係、色調、來源和 `assets/` 圖示檔。任何錯誤都以非零狀態停止建置並指出資料列。

## 靜態輸出契約

- `data/catalog-index.json` 含 `schemaVersion`、分類陣列及條目清單摘要（ID、分類、名稱、圖示、標籤、色調、實裝狀態、seasonal 標記）。
- `data/entries/<id>.json` 含 `schemaVersion` 及一筆完整條目，條目欄位依[條目資料契約](content-contract.md)。
- JSON 只含頁面所需資料，不含資料庫欄位、建置資訊或未公開內容。刪除條目後，重新建置不得殘留其 JSON。
- JSON 以 UTF-8 輸出，保留中英文文字及資料順序。網址使用相對路徑，支援 GitHub Pages 專案子路徑。
