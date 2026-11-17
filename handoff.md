# 交接摘要

## 目前狀態

SQLite schema v4 收錄 446 筆條目，包含全部神器、消耗品、其他物品、124 個附魔及 228 件武器／盔甲。武器 117 筆內建附魔關聯現已逐筆記錄 Bullet 底圖及階級。124 個附魔已逐條加入英雄／怪物可用性、兩側效果、來源和可信度；低可信條目共 10 筆，詳見[附魔效用規格](docs/specs/enchantment-availability.md)。附魔主欄顯示效果摘要；預設展開的「更多資訊」列出包含 Audience 與可信度的完整判讀 facts、原文、關聯和來源。兩種版型的物品列表欄獨立捲動，詳情欄固定並可內捲；窄版使用詳情抽屜。盤點缺漏見[內容盤點](docs/content-coverage-audit.md)。`file://` 啟動使用 classic loader 與建置生成 bundle。驗收依[詳情呈現規格](docs/specs/detail-presentation.md)和[內建附魔標記計畫](docs/plans/2026-11-17-built-in-enchantment-markers.md)執行；本輪實測數字回寫 ROADMAP。GitHub Pages 尚未發布；後續依 [Wiki 首版計畫](docs/plans/2026-11-15-wiki-launch.md) 確認素材公開條件與 GitHub 登入／remote。

## 已完成

- 物品說明與排序｜47 筆神器、消耗品與其他物品的通用佔位說明已移除；Sword 系列排在 Spear 後、Tempest Knife 前；遠程與盔甲順序已驗收
- 全部條目與資料契約｜7 個分類、schema v4、446 筆條目；消耗品依食物、藥水、彈藥排序；神器納入「全部裝備」；條目標示實裝與 Seasonal 狀態
- 附魔雙側效用｜124 筆皆列英雄／怪物可用性與效果、可信度及來源；high 44、medium 70、low 10。Wiki 標待查或來源衝突者低可信，未作遊戲內驗證
- 詳情呈現｜同效附魔只顯示玩家效果並附怪物同效註記；有差異時保留怪物效果附註；「更多資訊」預設展開，納入推論／查證 facts、原文、關聯與來源
- 驗證｜`npm test` 21/21；`npm run build` 7 分類、446 條目；`dist/index.html` 3,911 bytes、446 筆資料檔，Critical Hit 雙側差異及附魔 Wiki 原文可查。未開瀏覽器、未驗實際渲染與互動

## 未完成待辦

- 公開 GitHub Pages 首版｜素材公開條件與 GitHub 登入／remote 尚未確認，依 `docs/plans/2026-11-15-wiki-launch.md` 繼續

## 待決問題

無。

## 本輪不可碰的範圍

無新增限制；資料庫 schema v1 與內容契約見 `docs/specs/catalog-storage.md`、`docs/specs/content-contract.md`。

## 下一步建議任務

依 Wiki 首版計畫核對素材使用條件與發布設定；擴充其他物品時沿用 `docs/project-rules.md` 的整頁總表→具體項目頁→SQLite、圖標登錄與自動同步流程。
