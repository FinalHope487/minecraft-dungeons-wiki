# 交接摘要

## 目前狀態

- SQLite schema v6 收錄 7 個分類、446 個條目、124 個附魔及 228 件近戰／遠程武器與盔甲。
- 附魔稽核涵蓋 253 筆效果 facts：source 169、inference 83、unknown 1；效果關係 same 7、different 12、unknown 105。16 筆來源不足以比較完整效果的關係標為 unknown，雙側來源效果同層顯示；完整判讀見[附魔效用規格](docs/specs/enchantment-availability.md)與[稽核資料](docs/audits/enchantment-effect-facts.json)。未作遊戲內實測。
- 2026-11-18 完成[附魔效果改寫](docs/plans/2026-11-18-enchantment-effect-rewrite.md)，提交 `f3af2e23ab3de189e1a0c9fa2004286dee896ec9`：11 批核對 124/124 個附魔與 253/253 筆 facts，44 筆改寫、87 個雙語欄位變更；逐筆舊值、新值、證據與處置見[進度稽核](docs/audits/enchantment-effect-rewrite-progress.json)。Multishot 玩家／怪物效果關係仍為 `unknown`，待 Wiki 固定版次確認。
- 五筆舊複合怪物效果保留原 claim 與 fact ID 為 inference，另有五筆 source facts 用於主欄。v5→v6 遷移會為舊版未固定的怪物效果來源追加固定 Wiki 修訂，原來源與資料保留。
- 武器 117 筆內建附魔關聯記錄 Bullet 底圖及階級；icon recipe 控制疊圖比例。兩種版型的物品列表欄獨立捲動、詳情欄固定並可內捲；`file://` 使用 classic loader 與建置生成 bundle。
- 內容缺漏與驗收狀態見[內容盤點](docs/content-coverage-audit.md)、[結構化資料計畫](docs/plans/2026-11-18-structured-catalog-v6.md)及 ROADMAP。GitHub Pages 尚未發布。

## 本輪驗證

- `npm test`：47/47 通過；`npm run build`：7 個分類、446 個條目。
- 本地 `dist` 靜態檢查：446/446 個條目 JSON 與 file bundle 一致；506/506 個玩家／怪物雙語效果欄位與 SQLite 一致。schema v6、1,325 facts、426 icons、572 有向關聯；所有圖標存在，沒有 SQLite／migration 產物。
- SQLite integrity check 為 `ok`，foreign key check 為空；未開瀏覽器。

## 下一步

依[附魔改寫計畫](docs/plans/2026-11-18-enchantment-effect-rewrite.md)將 Wiki 原文區改為使用來源摘錄，避免階級補充混入原文；再確認 Multishot 的 Wiki 固定版次證據，確認前維持 `unknown`。之後依[Wiki 首版計畫](docs/plans/2026-11-15-wiki-launch.md)確認素材公開條件與 GitHub 發布設定，驗收 GitHub Pages。遠端為 `origin`，目前分支為 `main`。
