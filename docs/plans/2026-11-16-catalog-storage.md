# 圖鑑 SQLite 資料儲存實作計畫

## 目標與狀態

把圖鑑資料放進本機 SQLite，push 後由 GitHub Actions 建置成靜態 JSON，前端選取條目時載入詳情並延遲請求離屏圖片。

規格：[SQLite 圖鑑資料庫規範](../specs/catalog-storage.md)、[條目資料契約](../specs/content-contract.md)。狀態：完成（本機實作與驗收）。

## 改動邊界

- 資料：`content/catalog.sqlite`、`content/schema.sql`。原 `content/catalog.mjs` 的現有資料原樣遷入資料庫後移除舊來源。
- 建置：Node 內建 `node:sqlite` 查詢唯讀 DB、驗證並輸出 `dist/data/` JSON。
- 前端：初始載入索引 JSON，選取條目時載入並快取詳情 JSON；圖片使用原生 lazy loading。
- 本機預覽：啟動伺服器時從 SQLite 更新忽略追蹤的 `data/` JSON，僅透過靜態伺服器供前端讀取。
- Pages：維持 push 到 main 的既有流程，不安裝 npm 依賴，不發布 SQLite。

## 架構決策

- 使用 `node:sqlite`，不加 npm 套件；最低 Node 版本升至 22.13。其實驗性只影響建置工具，使用範圍限唯讀查詢與資料匯出。
- SQLite 採正規化資料表，翻譯以語言列保存，重複展示屬性以可排序子資料列保存。
- 不在瀏覽器載入整份資料庫。分類索引足以顯示清單，完整條目按選取載入；圖片請求由瀏覽器 lazy loading 控制。

## 步驟與驗證

1. 建立 schema v1、資料庫讀取與發布前驗證。驗證非法 ID、缺翻譯、壞關聯、非 HTTPS 來源或缺圖示時建置停止。
2. 將現有 4 個分類和 6 筆條目逐筆遷移至 SQLite，確認欄位、順序、翻譯和關聯值與舊來源一致。
3. 匯出索引和分條目 JSON，更新 build 只複製公開檔案；檢查 `dist/` 不含 `.sqlite` 或 schema。
4. 改前端從索引 JSON 建立畫面，選取時抓取詳情並快取；失敗時記錄錯誤並提供重試。確保連續選取不會被較慢的舊請求覆蓋。
5. 對列表、分類、關聯圖示設 lazy loading；選取詳情主圖優先載入。瀏覽器確認列表圖為 `loading="lazy"`、所選詳情主圖為 `loading="eager"`。目前只有 6 筆樣本，未能實證數百筆資料下的離屏圖片網路請求量。
6. 調整本機預覽白名單、README、內容契約與 Pages workflow（僅在版本需求必要時調整）。
7. 執行既有路由測試、建置、預覽及瀏覽器檢查：核對雙語、兩種版型、網址還原及行動版詳情面板。

## 切換與回退

現有資料是未部署首版原型，沒有使用者存檔。遷移前保留舊 module 供一次性匯入；核對 DB 和 JSON 輸出後，再讓 SQLite 成為唯一來源。若建置未通過，保留舊來源並停在本地，不發布。

## 執行結果

已完成。遷移後以深度比對確認 4 個分類、6 筆條目與舊資料完全一致；舊資料模組已移除。`npm test`：5 通過、0 失敗、0 略過；`npm run build`：成功，輸出 4 分類、6 條目。`dist/data/` 產生 1 份索引及 6 份詳情 JSON，確認輸出不含 SQLite 或 schema。

本機 Chromium 驗收：桌面版載入與 Diamond Sword 詳情正常；中英文、inventory/compact 版型切換保留 hash，重整可還原選取項目；390×844 行動視窗可開關詳情面板並返回焦點。列表圖片顯示 lazy、詳情主圖 eager。樣本規模不足以量測大量離屏圖片的實際請求節省。瀏覽器記錄另有非同步 message-channel 錯誤；同一檢查也記錄到 MetaMask 擴充套件來源訊息，未見應用程式原始碼位置或可見頁面故障。
