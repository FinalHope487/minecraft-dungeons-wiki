# 神器分類與 Death Cap Mushroom 樣本

## 目標與範圍

為圖鑑新增「神器 / Artifacts」分類，先收錄一筆 Death Cap Mushroom 樣本。神器分類設定 `group_key='equipment'`，使樣本也出現在「全部裝備」；既有近戰、遠程、盔甲與附魔分類維持原有內容。資料仍由 SQLite 提供，圖標透過既有 Wiki 同步腳本取得。

## 來源查核

- 彙整頁：[Dungeons:Artifact](https://minecraft.wiki/w/Dungeons%3AArtifact)
- 項目頁：[Dungeons:Death Cap Mushroom](https://minecraft.wiki/w/Dungeons%3ADeath_Cap_Mushroom)
- 項目頁列出遊戲說明、30 秒冷卻、攻擊速度增加 100% 和移動速度增加 20%；隨物品強度變動的持續時間不列入固定效果欄。
- 主圖採項目頁目前的 `Death Cap Mushroom (MCD).png`，由 `npm run icons:sync` 解析目前 Wiki 圖檔並更新來源 manifest。
- 繁中名稱與描述為圖鑑翻譯，未標示為遊戲官方譯名。

## 改動

- 在 `content/catalog.sqlite` 新增 `artifacts` 分類與 `death-cap-mushroom` 條目，含中英文、冷卻、固定效果及兩筆 Wiki 頁面來源；`artifacts` 排在盔甲後、附魔前。
- 在 `src/icon-assets.mjs` 與 `tools/sync-wiki-icons.mjs` 登記圖標 ID、素材檔名及項目頁。
- 更新分類範圍、資料來源、查找收錄流程、路由清單與神器樣本規格。

## 驗收

- `#artifacts` 顯示 Death Cap Mushroom；`#all` 同時列出該神器，其他裝備分類不混入神器。
- `npm run icons:sync:dry-run` 找到指定項目頁圖檔；`npm run icons:sync` 取得 Wiki 當前 PNG 並寫入 manifest。
- `npm test`、`npm run build` 與本機預覽檢查依執行結果記錄。

## 執行結果

- `npm run icons:sync:dry-run` 通過，Wiki API 在 Death Cap Mushroom 項目頁找到指定圖檔；`npm run icons:sync` 成功同步 35 個目前 Wiki PNG，新增圖檔為 `File:Death Cap Mushroom (MCD).png`，下載 63,713 bytes。
- `npm test` 通過（10/10）；`npm run build` 成功（5 個分類、33 筆條目）。
- Chromium 預覽確認神器分類與條目在背包版正常顯示、中英文和神器事實欄正確；橫向英文版顯示 1 筆神器；「全部裝備」顯示 31 筆並含死亡帽菇。
