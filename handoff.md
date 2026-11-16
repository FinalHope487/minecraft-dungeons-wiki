# 交接摘要

## 目前狀態

SQLite 是圖鑑唯一資料來源。神器分類與 Death Cap Mushroom 樣本已接入；`npm test` 10/10、`npm run build` 成功（5 分類、33 條目）。Chromium 已確認神器分類、雙語內容、橫向版與「全部裝備」31 條目。GitHub Pages 尚未發布；後續依 [Wiki 首版計畫](docs/plans/2026-11-15-wiki-launch.md) 確認素材公開條件與 GitHub 登入／remote。

## 已完成

- 神器分類與 Death Cap Mushroom 樣本｜Wiki 彙整頁、項目頁與主圖同步；Artifact facts 含類型、30 秒冷卻與固定速度效果；持續時間等級變化未納入｜細節見 [神器擴充計畫](docs/plans/2026-11-16-artifact-category.md)
- 分類路由及資料契約｜`#artifacts` 單獨顯示神器；`#all` 包含近戰、遠程、盔甲、神器；附魔仍獨立
- 驗證｜路由測試 10/10；建置 5 分類、33 條目；Chromium 核對繁中背包版、英文橫向版與總覽 31 筆

## 未完成待辦

- 公開 GitHub Pages 首版｜素材公開條件與 GitHub 登入／remote 尚未確認，依 `docs/plans/2026-11-15-wiki-launch.md` 繼續

## 待決問題

無。

## 本輪不可碰的範圍

無新增限制；資料庫 schema v1 與內容契約見 `docs/specs/catalog-storage.md`、`docs/specs/content-contract.md`。

## 下一步建議任務

依 Wiki 首版計畫核對素材使用條件與發布設定；後續加神器時沿用 `docs/project-rules.md` 的整頁總表→具體項目頁→SQLite、圖標登錄與自動同步流程。
