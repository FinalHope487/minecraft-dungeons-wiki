# 2026-11-16 · SQLite 作為靜態圖鑑來源

**決策**：以 `content/catalog.sqlite` 作唯一可編輯資料來源；建置時用 Node `node:sqlite` 驗證並產生靜態 JSON，前端按選取載入條目詳情。

**依據**：GitHub Pages 不執行資料庫服務；本站資料只在 push 後更新。Node 內建 SQLite 避免新增 npm 相依，圖鑑規範見 `docs/specs/catalog-storage.md`。

**反悔成本**：替換 `tools/catalog.mjs` 的 SQLite reader/exporter，重新產生 JSON 並更新 `content/catalog.sqlite`；現有網址與前端 JSON 契約可保留。若 Node SQLite API 有不相容變更，只需替換建置端 adapter。

**決策者**：Codex，依使用者要求實作；使用者可隨時推翻。
