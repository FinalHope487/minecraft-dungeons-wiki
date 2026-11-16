# 條目資料契約

[SQLite 圖鑑資料庫規範](catalog-storage.md) 定義資料來源與靜態輸出方式。`content/catalog.sqlite` 是兩種版型的共同資料來源；分類欄位輸出為 `id`、`label`、`icon`。將分類的群組設為 `equipment` 時，其條目會納入「全部裝備」。條目欄位如下。

| 欄位 | 內容 |
| --- | --- |
| `id`、`category` | 全站唯一的小寫連字號 ID，分類必須存在。發布後保留 ID 以維持網址。 |
| `name`、`badge`、`description` | 名稱、稀有度標籤與說明。神器英文說明逐條採用 Wiki 條目頁的 `In-game description` 原文。 |
| `icon`、`tone` | 已在來源表登記的穩定語意圖標 ID，以及現有 `steel`、`gold` 或 `violet` 外觀。實際檔名和類型由 `src/icon-assets.mjs` 登錄表解析。 |
| `implemented` | 布林值。`false` 表示 Wiki 標為未使用／未實裝；季節限定但已加入遊戲的物品仍標為 `true`。 |
| `seasonal` | 布林值，預設 `false`。`true` 表示 Wiki 標示為季節限定；顯示 Seasonal 標籤，與實裝狀態分開呈現。 |
| `facts` | 依序顯示的 `{ label, value }`。裝備與物品可用類型、出現任務或已核實用途；附魔可用適用類型與觸發條件，神器可用冷卻及已核對的固定效果。 |
| `traits` | 固有效果的 `{ icon, label }`。Wiki 武器總表列出的普通效果使用 `Regular Bullet`（ID：`regular-bullet`），Unique 效果使用 `Unique Bullet`（ID：`unique-bullet`）；個別掉落物的附魔槽不納入。 |
| `links` | `{ id, label }`。用標籤說明關係，例如固定特性對應的機制。關聯目標須已收錄且有來源；若本輪依據已查證的直接關聯新增目標條目，該條目也須符合圖鑑範圍並有來源。 |
| `sources` | 至少一筆 `{ label, url }`，連結至可查核的 HTTPS 來源。 |

分類名稱、條目名稱、稀有度、描述、事實欄位的標籤與值，以及固定特性和關聯的標籤，都使用 `{ "zh-Hant": "...", en: "..." }`。來源標籤保留原始頁名。裝備與神器描述的 `en` 欄保留 Wiki 原文，神器以 `In-game description` 欄為準；繁中依英文原文翻譯。尚未核對遊戲繁中用語時使用圖鑑翻譯。

分類和條目可重用同一圖標 ID；關聯項目重用目標條目的圖標。不得依 ID 猜副檔名，所有引用都須解析到 `src/icon-assets.mjs` 中存在的素材；細節見[圖標素材規範](icon-assets.md)。

空的次要欄位使用空陣列。隨裝備強度變動的數值不進入展示資料。附魔階級如需收錄，以已查證的階級效果或機制描述呈現。公開條目使用 Minecraft Dungeons 一代的資料。
