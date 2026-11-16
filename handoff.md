# 交接摘要

## 目前狀態

SQLite schema v2 收錄神器、消耗品與其他物品；消耗品依食物、藥水、彈藥排序，未實裝狀態和 Wiki placeholder 已接入。`file://` 啟動使用 classic loader 與建置生成 bundle；`npm test` 14/14，build 7 分類、126 條目。已檢查本地入口、bundle 語法、126 份資料與圖標；未開瀏覽器，渲染和互動未驗證。細節見[本機啟動計畫](docs/plans/2026-11-17-file-url-bootstrap.md)。GitHub Pages 尚未發布；後續依 [Wiki 首版計畫](docs/plans/2026-11-15-wiki-launch.md) 確認素材公開條件與 GitHub 登入／remote。

## 已完成

- 神器與消耗品完整收錄｜53 件神器、食物 10、藥水 15、彈藥 4、其他物品 12；25 件未實裝項目有狀態，21 件缺少單品圖標者使用 Wiki `?` placeholder｜[收錄計畫](docs/plans/2026-11-17-full-artifacts-consumables.md)
- 分類與資料契約｜7 個分類、schema v2；消耗品依食物、藥水、彈藥排序；神器納入「全部裝備」
- 驗證｜`npm test` 13/13；建置 126 條目；本地檢查 126 份詳情 JSON 和全部引用圖標。未驗證瀏覽器渲染與互動

## 未完成待辦

- 公開 GitHub Pages 首版｜素材公開條件與 GitHub 登入／remote 尚未確認，依 `docs/plans/2026-11-15-wiki-launch.md` 繼續

## 待決問題

無。

## 本輪不可碰的範圍

無新增限制；資料庫 schema v1 與內容契約見 `docs/specs/catalog-storage.md`、`docs/specs/content-contract.md`。

## 下一步建議任務

依 Wiki 首版計畫核對素材使用條件與發布設定；擴充其他物品時沿用 `docs/project-rules.md` 的整頁總表→具體項目頁→SQLite、圖標登錄與自動同步流程。
