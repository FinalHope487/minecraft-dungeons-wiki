# 本輪目標

把裝備與附魔資料改為本機 SQLite 原始資料，建置成 GitHub Pages 可讀的靜態 JSON，並延遲載入未進入視窗的圖片。

## 完成條件

- `content/catalog.sqlite` 是分類、條目、翻譯、屬性、關聯與來源的唯一可編輯資料來源。
- 建置會驗證資料庫和圖示，輸出分類／清單索引及各條目 JSON；部署產物不含 SQLite 檔案。
- 網頁從索引 JSON 顯示分類與條目，只在選取條目時載入詳細 JSON；列表圖片採原生 lazy loading。
- GitHub Pages 仍在 push 到 `main` 後建置部署，瀏覽器不連外部資料服務。
- 保留現有網址路由、語言、兩種版型和資料內容。

## 範圍

- `docs/specs/`、`docs/plans/`、內容 schema、建置工具、網站資料載入、既有路由測試引用、README 與 Pages workflow。

## 不碰

- 不修改遊戲資料內容、圖檔、頁面視覺設計、公開部署設定或 Git 歷史。
