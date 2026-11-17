# 武器內建附魔階級與 Bullet 疊圖

## 目標與狀態

依[專案規格](../spec.md)及[盤點紀錄](../content-coverage-audit.md#武器內建附魔階級與圖標盤點)，為 117 筆近戰與遠程武器內建附魔記錄 Bullet 底圖和階級，並在詳情顯示疊圖標記。**狀態：已驗收。**

## 改動邊界

- SQLite schema、v3→v4 遷移 SQL 及 `content/catalog.sqlite`。
- JSON exporter、HTTP/file URL schema 驗證和詳情呈現。
- Wiki 裝備驗收 fixture、內容規格、盤點與決策文件。
- 不新增圖標素材；重用附魔圖標及 `regular-bullet`、`unique-bullet`。

## 步驟與驗證

1. 建立附魔關聯中繼資料表，遷移 117 筆關聯；驗證 97 Unique、20 Regular、105 階級 I、1 階級 II、1 階級 III、10 筆無階級。
2. 匯出 `builtInEnchantment` 契約並將 JSON schema 升至 4；驗證一般關聯未帶入內建附魔中繼資料。
3. 在對應特性列以 Bullet 圖標為底疊上帶橘框的附魔原圖標；所有 built-in 連結都套用，不區分 Regular／Unique。「更多資訊」內關聯只顯示附魔原圖標、關聯文字與階級。
4. 更新逐筆 fixture 與契約測試；執行 `npm test`、`npm run build`，靜態檢查本地 `dist` 的 schema、資料、中繼資料與圖標登錄。

## 切換與回退

遷移僅新增資料表及 117 筆關聯中繼資料，不刪除現有欄位或關聯。回退需還原 v3 SQLite、schema、migration、JSON exporter、file bundle、前端與 fixture；網址不變。JSON schema 4 不與 v3 bundle 混用。

## 執行結果

`npm test` 與 `npm run build` 的本輪結果記於 ROADMAP 基線。schema v5 為 117 筆關聯保存 Bullet 特性列關聯；特性列以 Bullet 為底疊橘框附魔圖標，底下關聯使用無框原圖標。未開瀏覽器，實際渲染仍未驗證。
