# 圖標素材規範

## 範圍與版本基準

此規範涵蓋裝備、附魔、固定特性、分類和關聯項目使用的語意圖標。背包底圖、格框、稀有度框和字型屬於介面素材，另記於[素材與資料來源](../sources.md)，不放進圖標登錄表。

外觀基準採《Minecraft Dungeons》一代最終版 1.17.0.0。每項素材記錄核對的遊戲版本；無法確認時標記「版本未核實」。版本證據見[素材與資料來源](../sources.md)。

## 類型與重用

| 類型 | 用途 | 規則 |
| --- | --- | --- |
| `equipment` | 近戰、遠程、盔甲物品圖 | 使用遊戲中的物品圖；分類和關聯可重用相同 ID，不為相同圖檔另存副本。 |
| `artifact` | 神器物品圖 | 使用遊戲中的神器圖標；分類可重用代表神器的圖標 ID。 |
| `consumable` | 食物、藥水、彈藥及其他任務物品 | 使用遊戲中對應物品圖；分類可重用首筆條目的圖標 ID。 |
| `placeholder` | Wiki 未提供可用的單品圖標 | 重用 Wiki 的 `DungeonsMiscellaneousSprite ?.png`，顯示為未知物品 placeholder。 |
| `enchantment` | 附魔條目及附魔分類 | 使用該附魔的遊戲圖標；不可把附魔槽框誤當成附魔圖標。 |
| `built-in-property` | 裝備固有屬性／特性標記 | 使用遊戲屬性列的原始標記。同一標記若對應多條描述，就重用同一 ID；不要按文字自製不同圖案。 |
| 關聯 | 連到另一個圖鑑條目 | 直接重用目標條目的 `icon`，不新增重複素材。 |
| 分類 | 分類導覽按鈕 | 盡量重用最能代表該分類的裝備、附魔或物品 ID；只有遊戲確有獨立分類圖時才新增素材。 |


依 Wiki 武器總表標記固有效果。普通效果使用灰色菱形 `regular-bullet`（Regular Bullet）與灰色文字；Unique 效果使用橘色菱形 `unique-bullet`（Unique Bullet）與橘色文字。只呈現已核對的效果。

武器內建附魔在對應特性列以 Regular／Unique Bullet 為底。有附魔圖標時疊上透明底的無框圖標，缺圖時只顯示 Bullet。底下關聯只顯示附魔原圖標。關聯中繼資料記錄 Bullet 類型、對應特性列與階級；無階級的 Exclusive 效果顯示「無階級」，不得預設標為 I。

## 來源、命名與呈現

- 優先使用條目頁可核對的 Wiki 原圖，其次使用可確認版本的遊戲原始圖檔。無獨立原圖時可從有版本證據的遊戲畫面裁切，並記錄截圖網址與裁切說明。不得手繪、生成或以幾何形狀替代圖標。
- 條目頁沒有可用的單品圖標時使用 Wiki 的 `DungeonsMiscellaneousSprite ?.png`；不要為了避免 placeholder 而改用無關物品圖。
- 將圖標 ID、相對檔名、種類、已知 Wiki 頁面、Wiki 檔名及來源性質登錄在 `content/catalog.sqlite` 的 `icon_assets`；同一圖檔只登錄一次。`docs/wiki-icon-sync.json` 保存最近一次同步的檔案雜湊與時間，作稽核紀錄，不作執行期登錄表。
- ID 使用小寫連字號描述素材語意。`src/icon-assets.mjs` 只把已登錄 ID 解析成安全的相對 URL；未知 ID 或缺檔時停止建置並指出引用。
- 內建附魔構圖由 SQLite 的 `icon_recipes` 提供角色、比例及框樣式。兩種 Bullet 的疊圖寬高均為容器的 81%，框樣式均為 `none`。修改 Regular 的 `built_in_enchantment` 或 Unique 的 `built_in_enchantment_unique` 配方並重新建置，即可同步該類型的所有疊圖。
- 執行 `npm run icons:sync:dry-run` 核對資料庫登錄圖標仍出現在指定 Wiki 頁面；確認後執行 `npm run icons:sync`。同步工具從 SQLite 讀來源清單和輸出檔名，再更新素材及稽核紀錄。
- 記錄條目網址、檔名、取得日期及授權狀態。公開發布前依 Minecraft 使用指南核對素材使用條件。來源同步證據見[素材同步紀錄](../wiki-icon-sync.json)。
- 大型物品圖可用 WebP。須保留透明背景和像素邊緣的小型標記使用 PNG。保留原圖的色彩、透明度、比例和像素結構；畫面以 `object-fit: contain` 和像素插值呈現。
