# 神器與消耗品完整收錄

## 目標與狀態

**狀態：完成**。依[專案規格](../spec.md)完整收錄 Wiki 具名神器、食物、藥水、彈藥與其他物品，並標示是否實裝。消耗品只用一個分類，內部依食物、藥水、彈藥順序分組。

## 改動邊界

- SQLite schema v2、新增神器／食物／消耗品／其他物品條目及實裝狀態。
- 靜態 JSON 契約、列表和詳情狀態標記。
- Wiki 主圖、單品 sprite 與缺圖 placeholder 同步。
- Wiki roster 覆蓋驗收與本地 HTML 建置產物檢查。

## 步驟與驗證

1. 逐項比對 `Dungeons:Artifact` 與 `Dungeons:Consumable` 清單，將 Food、Potions、Ammo 分組排入「消耗品」，Other 留在「其他物品」。
2. SQLite 新增 `implemented` 欄位；未使用項目標記為 false，既有資料預設為 true。同步 JSON schema 和畫面狀態標記。
3. 優先同步 Wiki 條目主圖或 `DungeonsItemSprite`；都沒有時使用 `DungeonsMiscellaneousSprite ?.png`。
4. 執行 `npm test`、`npm run build`，直接檢查 `dist/index.html`、CSS、JS、分類索引、條目 JSON 和圖標檔；不開瀏覽器或預覽伺服器。

## 切換與回退

schema v2 只在既有條目上新增預設為 1 的欄位，保留原有條目 ID。回退時需還原 schema、SQLite、匯出契約、畫面和新增素材。

## 執行結果

Wiki roster 收錄 53 件神器、10 件食物、15 件藥水、4 件彈藥與 12 件其他物品，共 94 筆。季節限定 Corrupted Pumpkin 標為已實裝；未實裝項目共 25 件。21 件沒有單品圖標的物品使用 Wiki `?` placeholder。

`npm test` 通過 13/13；`npm run build` 產出 7 個分類、126 筆條目。直接檢查 `dist/index.html`、CSS／JS、126 份詳情 JSON，以及每筆引用圖標的類型與檔案。未開瀏覽器；實際渲染與互動未驗證。
