# 圖標素材規範

## 範圍與版本基準

此規範涵蓋裝備、附魔、固定特性、分類和關聯項目使用的語意圖標。背包底圖、格框、稀有度框和字型屬於介面素材，另依 `docs/sources.md` 記錄，不放進圖標登錄表。

本圖鑑收錄的是《Minecraft Dungeons》一代，不是續作。外觀基準採一代最終版 1.17.0.0；[Mojang 說明 1.17 為遊戲最終更新](https://www.minecraft.net/en-us/article/dungeons--25-million-players)，[遊戲資料庫標示圖檔取自 1.17.0.0](https://www.dungeons.tools/weapons/diamond-sword)。之後新增素材都要記錄實際核對的遊戲版本；無法確認時標明「版本未核實」，不可推測。

## 類型與重用

| 類型 | 用途 | 規則 |
| --- | --- | --- |
| `equipment` | 近戰、遠程、盔甲物品圖 | 使用遊戲中的物品圖；分類和關聯可重用相同 ID，不為相同圖檔另存副本。 |
| `artifact` | 神器物品圖 | 使用遊戲中的神器圖標；分類可重用代表神器的圖標 ID。 |
| `consumable` | 消耗品、其他任務物品圖 | 使用遊戲中的對應物品圖；分類可重用首筆條目的圖標 ID。 |
| `enchantment` | 附魔條目及附魔分類 | 使用該附魔的遊戲圖標；不可把附魔槽框誤當成附魔圖標。 |
| `built-in-property` | 裝備固有屬性／特性標記 | 使用遊戲屬性列的原始標記。同一標記若對應多條描述，就重用同一 ID；不要按文字自製不同圖案。 |
| 關聯 | 連到另一個圖鑑條目 | 直接重用目標條目的 `icon`，不新增重複素材。 |
| 分類 | 分類導覽按鈕 | 盡量重用最能代表該分類的裝備、附魔或物品 ID；只有遊戲確有獨立分類圖時才新增素材。 |

普通固有效果使用 Wiki 標為 `Regular Bullet` 的灰色菱形；Unique 效果使用 `Unique Bullet` 的橘色菱形。不可只依資產檔名推測圖樣。Minecraft Wiki 的[武器總表](https://minecraft.wiki/w/Dungeons%3AWeapon)可見兩者如何標記普通武器效果和 Unique 額外效果；[Diamond Sword 條目](https://minecraft.wiki/w/Dungeons%3ADiamond_Sword)將 Extra damage 對應至 `unique-bullet.png`。特性文字顏色依標記圖標區分：普通效果為灰色，Unique 效果為橘色。

## 來源、命名與檔案

1. 查找圖標時，先用 Minecraft Wiki 的整頁彙整入口：[物品總覽](https://minecraft.wiki/w/Dungeons%3AItem)、[武器](https://minecraft.wiki/w/Dungeons%3AWeapon)、[盔甲](https://minecraft.wiki/w/Dungeons%3AArmor)、[神器](https://minecraft.wiki/w/Dungeons%3AArtifact)、[附魔](https://minecraft.wiki/w/Dungeons%3AEnchantment)，再打開對應的一代《Minecraft Dungeons》項目條目確認名稱和上下文。以整頁彙整或項目條目作來源入口，不以單張圖片 URL 取代條目連結。直接從對應 Wiki 頁面取得的圖檔視為 Wiki 目前提供的最新版，不需再與舊檔或截圖逐位元比對；記錄條目網址、Wiki 檔名和取得日期，並確認沒有誤用《Dungeons II》條目。用 `npm run icons:sync` 按需更新本專案登錄的 Wiki 圖標：腳本先透過 MediaWiki Action API `prop=images` 確認指定檔案仍出現在來源條目，再用 `prop=imageinfo` 取得目前圖檔 URL 並寫入 `assets/`，同步記錄至 `docs/wiki-icon-sync.json`。manifest 分開記錄 API 上傳 metadata 和下載檔案本身的大小、MIME 與 SHA-1；不與專案舊圖比對。若 Wiki 頁面沒有可取得的圖檔，接著查找可確認來自一代最終版 1.17.0.0 的遊戲原始圖檔；仍無法取得獨立原圖時，才從有版本證據的遊戲畫面裁切作為暫用素材，並記錄截圖網址與裁切說明。不得手繪、生成或用幾何形狀替代原圖。
2. 每個 ID 使用小寫連字號並描述素材語意，例如 `diamond-sword`、`sharpness`、`unique-bullet`；不以形狀、顏色或顯示文字命名。相同圖檔只登記一次。
3. 檔案格式和路徑寫在 `src/icon-assets.mjs` 的 `iconAssets` 登錄表；不可從 ID 猜副檔名。大型物品圖可用 WebP；需要保留透明背景和像素邊緣的小型標記使用 PNG。登錄表記錄用途類型，素材來源和版本記在 `docs/sources.md`。
4. 保留原圖的色彩、透明度、比例和像素結構，不重畫、不加濾鏡、不拉伸。畫面用 `object-fit: contain` 和像素插值；尺寸由角色樣式控制，不改動原始素材來配版面。
5. 圖標依畫面需要載入：清單及非選取內容使用 lazy loading，選取項目主要展示圖可優先載入。新增登錄不會預先匯入或載入全部圖片。

## 驗證與新增流程

- SQLite 與輸出 JSON 只存穩定的圖標 ID；瀏覽器和建置共用登錄表解析檔案路徑。
- 建置時，分類、條目及特性引用的 ID 必須已登錄，對應檔案必須存在；未知 ID 或缺檔要報錯停止，不得靜默顯示空白或通用替代圖。
- 新增圖標時依序確認遊戲版本和原圖名稱、核對它所屬類型與重用關係、記錄來源／授權狀態、加入檔案和登錄表，再更新 SQLite 並建置檢查。
- 公開部署前依 Minecraft 使用指南核對素材使用條件。來源可追溯不代表自動取得再發布授權。

`npm run icons:sync:dry-run` 只查詢並顯示預計同步的 Wiki 頁面、檔名和上傳時間，不寫入圖檔。腳本依 MediaWiki 官方 [Images API](https://www.mediawiki.org/wiki/API:Images) 核對頁面引用，並依 [Imageinfo API](https://www.mediawiki.org/wiki/API:Imageinfo) 解析目前圖檔 URL；遇到頁面改名、檔案不在來源頁、非 PNG、非 Wiki 圖片網域或 HTTP/API 錯誤時會停止並輸出錯誤，不沿用舊檔假裝成功。來源記錄同時保留 API 提供的檔案 metadata 與下載回應的 SHA-1、位元組數和 MIME，方便確認實際同步內容。

## Extra damage 核對紀錄

Minecraft Wiki 將 Diamond Sword 的 `Extra damage` 屬性圖標標為 `DungeonsMiscellaneousSprite unique-bullet.png`；Mojang 確認一代最終更新是 1.17，遊戲資料庫的檔案版本為 1.17.0.0。Wiki 條目呈現的圖樣是橘色菱形徽記，與同步取得的檔案一致。此次把舊幾何名稱 `hex` 改為語意 ID `unique-bullet`；舊畫面裁切已由 Wiki 最新檔取代，來源與上傳時間記在 `docs/wiki-icon-sync.json`。
