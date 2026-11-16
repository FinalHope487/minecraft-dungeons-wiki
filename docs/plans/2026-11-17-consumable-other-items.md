# 消耗品與其他物品分類

## 目標與狀態

**狀態：已完成**。新增「消耗品」和「其他物品」獨立分類，各收錄一筆已實裝樣本：TNT 和 Mystery Banner。依[專案規格](../spec.md)收錄，兩類不屬於「全部裝備」。

## 改動邊界

- SQLite：新增 `consumables`、`other-items` 分類與 TNT、Mystery Banner 條目。
- 靜態素材：圖標登錄、Wiki 同步清單與同步 manifest。
- 介面內容：分類標籤、來源清單與站點簡介。
- 驗收：分類路由和兩筆雙語條目的來源契約。

## 步驟與驗證

1. 從 [Dungeons:Item](https://minecraft.wiki/w/Dungeons%3AItem) 和 [Dungeons:Consumable](https://minecraft.wiki/w/Dungeons%3AConsumable) 查到 [TNT](https://minecraft.wiki/w/Dungeons%3ATNT) 與 [Mystery Banner](https://minecraft.wiki/w/Dungeons%3AMystery_Banner) 項目頁。TNT 頁面記載投擲效果與消耗品類型；Mystery Banner 頁面記載任務修正效果與 1.9.1.0 加入紀錄。
2. 以既有 Wiki 同步腳本 dry-run 核對頁面圖標，再同步 PNG 和 manifest；資料庫使用這兩個圖標作為分類與條目圖標。
3. 更新範圍規格、來源清單、圖標契約與分類路由驗收。執行 `npm test`、`npm run build`，直接檢查本地建置的 HTML、JSON、CSS、JavaScript 和圖標，不開啟瀏覽器。

## 切換與回退

不改 SQLite schema 或 JSON 公開契約。回退時移除兩個分類和條目、兩張圖標及登錄、同步紀錄，再回復規格和來源文件。

## 執行結果

- Wiki 圖標 dry-run 通過；`npm run icons:sync` 同步 37 張 PNG，其中 TNT 與 Mystery Banner 圖標分別為 `File:TNT (Dungeons).png` 和 `File:Mystery Captain Banner.png`。
- `npm test` 通過，12/12；`npm run build` 通過，7 個分類、35 筆條目。建置驗證 `#all` 仍排除兩筆非裝備條目。
- 本地建置產物已直接檢查：HTML 引用 CSS 與 JavaScript；`catalog-index.json` 有 7 個分類、35 筆摘要，TNT 與 Mystery Banner 各位於指定分類，`#all` 的裝備清單維持 31 筆；兩筆完整 JSON 的雙語名稱、描述、來源及圖標路徑均存在，對應圖標也在 `dist/assets/`。未啟動瀏覽器；實際渲染與互動未驗證。
- 本輪提交：`c6b646f`（`feat(catalog): add consumable and other item categories`）。
