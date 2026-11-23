# Roadmap：later

狀態標為 `[later]` 的待辦項目。格式、標籤與規則見 [`ROADMAP.md`](../ROADMAP.md)；狀態改了就把條目搬到對應的檔。

---

<!-- 條目照 ROADMAP.md 開頭的格式。做完的直接刪掉，不留「已完成」條目。 -->

### [later] 簡報內嵌圖示改成不重複、縮小尺寸
**具體細節**：`slides/index.html` 內嵌圖示後約 915 KB；sword、critical-hit、hunters-armor 各內嵌 3 次，原圖 512px 只顯示成 64px，之後改簡報時檔案難讀（2026-11-24 冷審查建議）
**怎麼做**：重複的圖改用 CSS class 共用一份 data URI，或改成建置時才內嵌
**會改變什麼**：簡報檔變小、好編輯；畫面不變
**做後回退代價**：`git revert` 那個 commit 即可，沒有資料受影響

