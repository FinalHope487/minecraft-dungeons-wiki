# 2026-11-18 · 結構化圖鑑資料 v6

**決策**：以 SQLite v6 作唯一編輯來源；facts 以唯一 ID 識別主張、可重複 semantic key，並以 position 排序。來源、推論與未知性質分開保存；source 主張必須有 supports 證據，context 僅表示來源相關。關聯種類、附魔玩家／怪物效果、圖標登錄與 recipe 使用固定欄位。建置時由單一純政策依資料排序與呈現規則產生 HTTP 與 `file://` 共用的 JSON。圖標比例及框樣式由資料庫 recipe 控制。

**依據**：使用者要求改動一處資料即可同步所有相應欄位、排序與圖標規範。SQL 負責語意資料；`src/detail-policy.mjs` 負責呈現規則；未知值保留 `unknown`，不從文案推導。實作及回退流程見[計畫](../plans/2026-11-18-structured-catalog-v6.md)。

**反悔成本**：若要回退，還原 v5 SQLite、匯出器、JSON 契約及前端呈現，重新建置 `dist/`；公開條目 ID、網址與原有內容不變。重做的 v6 編輯資料可由 v5 SQLite 及遷移 seed 重建。

**決策者**：使用者核准整體結構化方向；Codex 代選欄位與模組邊界。
