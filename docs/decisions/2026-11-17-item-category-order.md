# 2026-11-17 · 物品分類與消耗品排序

**決策**：維持「神器」、「消耗品」、「其他物品」三個分類，不另設食物分類。消耗品內依 Wiki 子類將食物、藥水、彈藥依序分組；Wiki Other 項目留在「其他物品」。未實裝物品仍收錄並標示狀態。
**依據**：使用者決定；分類行為和清單驗收見 [`docs/spec.md`](../spec.md) 及 [`tests/fixtures/wiki-item-roster.json`](../../tests/fixtures/wiki-item-roster.json)。
**反悔成本**：若改成獨立分類，需調整 SQLite 分類與條目排序、路由驗收、圖鑑規格及分類圖標；目前 ID 和分享網址不變。
