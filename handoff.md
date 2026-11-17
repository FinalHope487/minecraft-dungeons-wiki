# 交接摘要

## 目前狀態

SQLite schema v3 收錄 446 筆條目，包含全部神器、消耗品、其他物品、124 個附魔及 228 件武器／盔甲。124 個附魔已逐條加入英雄／怪物可用性、兩側效果、來源和可信度；Critical Hit、Thorns、Protection、Thundering、Echo、Radiance、Gravity Pulse 等已記錄具體數值或觸發差異。低可信條目共 10 筆，詳見[附魔效用規格](docs/specs/enchantment-availability.md)與逐筆來源。`file://` 啟動使用 classic loader 與建置生成 bundle。`npm test` 21/21，build 7 分類、446 條目；直接檢查本地入口、bundle、124 筆附魔與 744 個效用欄位，未開瀏覽器。細節見[收錄計畫](docs/plans/2026-11-17-full-artifacts-consumables.md)與[本機啟動計畫](docs/plans/2026-11-17-file-url-bootstrap.md)。GitHub Pages 尚未發布；後續依 [Wiki 首版計畫](docs/plans/2026-11-15-wiki-launch.md) 確認素材公開條件與 GitHub 登入／remote。

## 已完成

- 物品說明與排序｜47 筆神器、消耗品與其他物品的通用佔位說明已移除；Sword 系列排在 Spear 後、Tempest Knife 前；遠程與盔甲順序已驗收
- 全部條目與資料契約｜7 個分類、schema v3、446 筆條目；消耗品依食物、藥水、彈藥排序；神器納入「全部裝備」；條目標示實裝與 Seasonal 狀態
- 附魔雙側效用｜124 筆皆列英雄／怪物可用性與效果、可信度及來源；high 44、medium 70、low 10。Wiki 標待查或來源衝突者低可信，未作遊戲內驗證
- 驗證｜`npm test` 21/21；建置 446 條目；本地檢查入口、離線 bundle、744 個附魔效用欄位及 Critical Hit 差異。未驗證瀏覽器渲染與互動

## 未完成待辦

- 公開 GitHub Pages 首版｜素材公開條件與 GitHub 登入／remote 尚未確認，依 `docs/plans/2026-11-15-wiki-launch.md` 繼續

## 待決問題

無。

## 本輪不可碰的範圍

無新增限制；資料庫 schema v1 與內容契約見 `docs/specs/catalog-storage.md`、`docs/specs/content-contract.md`。

## 下一步建議任務

依 Wiki 首版計畫核對素材使用條件與發布設定；擴充其他物品時沿用 `docs/project-rules.md` 的整頁總表→具體項目頁→SQLite、圖標登錄與自動同步流程。
