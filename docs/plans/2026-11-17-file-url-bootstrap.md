# 本機 file URL 啟動修正

## 目標與狀態

**狀態：完成**。讓直接開啟 `dist/index.html` 的本機檔案入口載入完整圖鑑；HTTP 部署繼續使用模組與分開載入的 JSON。

## 改動邊界

- HTML classic loader、file URL app bundle 與既有模組啟動路徑。
- Build 從同次產生的靜態 JSON 建立離線 bundle。
- 加入 file URL 啟動契約測試，更新規格與交接摘要。

## 步驟與驗證

1. 先測試入口使用 classic loader，且 file URL 路徑載入 bundle；目前模組入口重現失敗。
2. Build 產生無 ES module 語法、含索引與詳情 JSON 的 `dist/src/file-app.js`。
3. file URL 使用 bundle 載入資料；HTTP 使用既有模組和按需 JSON 載入。
4. 執行 `npm test`、`npm run build`，直接檢查入口、bundle 語法、全部資料與素材；不開瀏覽器。

## 切換與回退

回退時移除 classic loader 與 file bundle 產生器，還原原有 ES module 入口；SQLite 和靜態 JSON 格式不變。

## 執行結果

先前入口測試在 `type="module"` 斷言失敗；改用 classic loader 後通過。`npm test` 通過 14/14；`npm run build` 產出 7 個分類、126 筆條目。直接檢查 `dist/index.html` 和生成的 classic bundle：JavaScript 語法有效，bundle 內嵌索引與 126 份詳情 JSON 完全一致，所有圖標檔存在。未開瀏覽器；畫面渲染與互動未驗證。
