# SQLite 圖鑑資料庫規範

## 執行邊界

- `content/catalog.sqlite` 是唯一可編輯的圖鑑資料來源，版本化並隨 Git push 更新。
- SQLite 僅供本機內容編輯與 Node 建置工具讀取。GitHub Pages 只發布靜態 JSON 和圖片，不提供資料寫入或資料庫服務。
- 網頁先載入 `data/catalog-index.json`；選取條目時才載入 `data/entries/<id>.json`。瀏覽器不讀 SQLite，也不呼叫外部資料服務。
- 列表、分類及關聯圖片設定原生 `loading="lazy"`；目前選取條目的主圖優先載入。
- 建置只複製允許發布的靜態檔案。SQLite、schema、建置工具不得進入 `dist/`。

## 相容環境

- 建置工具使用 Node 內建 `node:sqlite`，不增加 npm 套件或外部服務。
- Node 最低版本為 22.13，因該版本起 `node:sqlite` 不需額外啟動旗標。Node 22 將此 API 標示為實驗性，限制在離線建置工具；升級 Node 時檢查[官方 API 狀態](https://nodejs.org/download/release/v22.15.0/docs/api/sqlite.html)。
- SQLite schema 版本存於 `PRAGMA user_version`。建置只接受已實作的版本；升級 schema 時先更新本文件、SQL schema 和匯出程式。

## Schema v1

Node 建置連線啟用所有外鍵；建置也會執行外鍵檢查。`position` 從 0 起算；條目使用全站唯一順序，其他子表在所屬父項內唯一。使用 UTF-8。可翻譯欄位不得以 JSON 塞入單一欄位。

| 表 | 欄位與用途 |
| --- | --- |
| `categories` | `id` 主鍵、`icon`、可空的 `group_key`、`position`。`group_key='equipment'` 的分類納入「全部裝備」。 |
| `category_translations` | `category_id`、`language`、`label`；主鍵為分類與語言。 |
| `entries` | `id` 主鍵、`category_id` 外鍵、`icon`、`tone`、全站唯一的 `position`。 |
| `entry_translations` | `entry_id`、`language`、`name`、`badge`、`description`；主鍵為條目與語言。 |
| `facts` | `id` 主鍵、`entry_id` 外鍵、`position`。每列是一組可重複的展示屬性。 |
| `fact_translations` | `fact_id`、`language`、`label`、`value`；主鍵為屬性與語言。 |
| `traits` | `id` 主鍵、`entry_id` 外鍵、`icon`、`position`。 |
| `trait_translations` | `trait_id`、`language`、`label`；主鍵為固定特性與語言。 |
| `entry_links` | `id` 主鍵、`entry_id` 外鍵、`target_entry_id` 外鍵、`position`。刪除仍被引用的目標時由外鍵拒絕。 |
| `entry_link_translations` | `link_id`、`language`、`label`；主鍵為關聯與語言。 |
| `entry_sources` | `id` 主鍵、`entry_id` 外鍵、`label`、`url`、`position`。來源 URL 必須使用 HTTPS。 |

初始支援語言為 `zh-Hant` 和 `en`。每個分類、條目、屬性、固定特性及關聯都必須具備這兩種語言且文字不可空白。新增語言需同時更新 locale、資料庫驗證及前端契約。

## 資料約束

- ID 使用 `^[a-z][a-z0-9-]*$`，全表唯一；發布後不得重用已公開 ID，以維持分享網址。
- 每筆條目必須屬於既存分類，分類和條目均須有圖示。
- `tone` 限 `steel`、`gold`、`violet`。目前可用分類群組為空值或 `equipment`。
- 每筆條目至少有一個 HTTPS 來源；所有關聯目標必須存在。
- `facts`、`traits`、`links`、`sources` 可為空，但展示順序依 `position`。
- 建置驗證外鍵、資料庫完整性、必要翻譯、ID、分類關係、色調、來源和 `assets/` 圖示檔。任何錯誤都以非零狀態停止建置並指出資料列。
- 等級、隨裝備強度變動數值及個別掉落物的附魔槽不屬於公開資料。

## 靜態輸出契約

- `data/catalog-index.json` 含 `schemaVersion`、分類陣列及條目清單摘要（ID、分類、名稱、圖示、標籤、色調）。
- `data/entries/<id>.json` 含 `schemaVersion` 及一筆完整條目，欄位映射維持既有內容契約：`id`、`category`、`name`、`icon`、`badge`、`tone`、`description`、`facts`、`traits`、`links`、`sources`。
- JSON 只含頁面所需資料，不含資料庫欄位、建置資訊或未公開內容。刪除條目後，重新建置不得殘留其 JSON。
- JSON 以 UTF-8 輸出，保留中英文文字及資料順序。網址使用相對路徑，支援 GitHub Pages 專案子路徑。
