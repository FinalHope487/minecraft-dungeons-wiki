# 條目資料契約

分類輸出欄位為 `id`、`label`、`icon`。資料來源與靜態輸出見[SQLite 圖鑑資料庫規範](catalog-storage.md)。

| 欄位 | 內容 |
| --- | --- |
| `id`、`category` | 全站唯一的小寫連字號 ID，分類必須存在。發布後保留 ID 以維持網址。 |
| `name`、`badge`、`description` | 名稱、稀有度標籤與說明。裝備的英語短引文見來源表。 |
| `icon`、`tone` | 已登錄的穩定語意圖標 ID，以及 `steel`、`gold` 或 `violet` 外觀。實際檔名和類型由 `src/icon-assets.mjs` 登錄表解析。 |
| `implemented` | 布林值。`false` 表示 Wiki 標為未使用／未實裝；詳情顯示狀態，物品格額外標示未實裝。季節限定但實際加入遊戲的物品標為 `true`。 |
| `seasonal` | 布林值，預設 `false`。`true` 表示 Wiki 標示為季節限定；詳情及物品格顯示 Seasonal 標籤，與 `implemented` 狀態分開呈現。 |
| `facts` | 依序顯示的 `{ label, value }`。裝備與物品可用類型、出現任務或已核實用途；附魔可用適用類型與觸發條件，神器可用冷卻及已核對的固定效果。 |
| `traits` | 固有效果的 `{ icon, label }`。依[圖標素材規範](icon-assets.md#類型與重用)選擇標記。 |
| `links` | `{ id, label, builtInEnchantment? }`。用標籤說明關係，例如固定特性對應的機制。關聯目標須已收錄且有來源。近戰／遠程武器指向附魔的每筆關聯都須附 `{ tier, propertyIcon }`；`tier` 為 `1`、`2`、`3` 或 `null`，`null` 用於無階級的 Exclusive 效果；`propertyIcon` 為 `regular-bullet` 或 `unique-bullet`，決定附魔圖標的底圖。其他關聯省略此欄。 |
| `sources` | 至少一筆 `{ label, url }`，連結至可查核的 HTTPS 來源。 |

分類名稱、條目名稱、稀有度、描述、事實欄位的標籤與值，以及固定特性和關聯的標籤，都使用 `{ "zh-Hant": "...", en: "..." }`。來源標籤保留原始頁名。裝備與神器描述的 `en` 欄逐字保留 Wiki 具體條目頁原文；神器以 `In-game description` 欄為準，繁中由英文原文翻譯。尚未核對遊戲繁中用語時使用圖鑑翻譯。

空的次要欄位使用空陣列。公開資料省略物品等級、隨裝備強度變動的數值（含神器持續時間），以及個別掉落實例的附魔與附魔槽。附魔階級如需收錄，以已查證的階級效果或機制描述呈現。
