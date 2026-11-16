# 2026-11-17 · 季節限定標記獨立於實裝狀態

**決策**：在條目契約加入 `seasonal` 布林值，預設 `false`；它與 `implemented` 分開顯示。現有 Corrupted Pumpkin 標為季節限定。

**依據**：使用者要求先建立 Seasonal 標籤，後續遇到季節物品再標記；Wiki 將 Corrupted Pumpkin 標示為 Special event item。實裝狀態不代表取得方式或季節限制，見 `docs/specs/content-contract.md`。

**反悔成本**：回退需改 SQLite schema、JSON schema、匯出驗證及雙語標籤；既有條目可將 `seasonal` 重設為 `false`，無需刪除資料。

**釘住**：`既有 Seasonal 神器有標籤，已實裝神器使用 Wiki 條目原文`

**決策者**：使用者確認標籤範圍；Codex 選擇以獨立布林欄位實作。
