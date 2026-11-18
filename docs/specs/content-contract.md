# 條目資料契約

分類輸出欄位為 `id`、雙語 `label`、`icon` 與 `position`。圖標檔案、類型及來源見索引的 `iconAssets`。靜態輸出流程見[SQLite 圖鑑資料庫規範](catalog-storage.md)。

## 條目欄位

| 欄位 | 內容 |
| --- | --- |
| `id`、`category`、`position` | 全站唯一小寫連字號 ID、既存分類及全站排序。發布後保留 ID 以維持網址。 |
| `name`、`badge`、`description` | 雙語名稱、稀有度標籤及說明。 |
| `descriptionStatus` | `source`、`placeholder` 或 `unknown`。只有 `source` 說明可作主欄內容；placeholder 不呈現。 |
| `icon`、`tone` | 穩定圖標 ID 及 `steel`、`gold` 或 `violet` 外觀。索引 `iconAssets` 將 ID 解析為檔名、素材類型和來源。 |
| `implemented`、`seasonal` | 分開表示遊戲實裝狀態與季節標記的布林值。 |
| `facts` | `{ id, position, semanticKey, claimOrigin, wikiStatus, label, value, evidence }`。`id` 唯一識別一筆主張；同一條目可有多筆相同 `semanticKey`，以 `position` 排序。`claimOrigin` 為 `source`、`inference` 或 `unknown`；`wikiStatus` 為 `unmarked`、`verify` 或 `unknown`。`evidence` 指向本條目來源，關係為 `context`、`supports` 或 `conflicts`。`source` 主張必須至少有一筆 `supports` 證據；`context` 不代表來源支持主張。不得只因存在同名 Wiki 頁就推定來源支持；未逐筆核實的主張保留為 `unknown`，來源標為 `context`。` |
| `traits` | 固有效果的 `{ id, icon, position, label }`。 |
| `links` | `{ id, linkId, kind, direction, position, label, builtInEnchantment? }`。`id` 是目標條目；`kind` 是 `base_variant` 或 `weapon_enchantment`。雙向顯示標籤由同一關聯種類與方向翻譯。內建附魔另含階級、Bullet 圖標及 `propertyTraitIndex`。 |
| `sources` | `{ id, label, url, position }`，至少一筆 HTTPS 來源。 |
| `enchantmentEffectProfile` | 僅附魔有此欄位：玩家／怪物可用性各為 `available`、`unavailable`、`unknown`；效果關係為 `same`、`different`、`unknown`；兩側效果以 fact ID 參照。 |
| `presentation` | 建置時由純呈現政策依上述資料衍生。包含排序後區段、效果分組、相關項目、判讀資料與 Wiki 原文，不在資料庫重複維護。 |

所有翻譯欄位使用 `{ "zh-Hant": "...", "en": "..." }`。來源標籤保留來源頁名。裝備與神器說明的 `en` 欄逐字保留 Wiki 具體條目頁原文；神器以 `In-game description` 欄為準，繁中由英文原文翻譯。尚未核實遊戲繁中用語時使用圖鑑翻譯。

空的次要欄位使用空陣列。公開資料省略物品等級、隨裝備強度變動的數值（含神器持續時間），以及個別掉落實例的附魔與附魔槽。附魔階級如需收錄，以已查證的階級效果或機制描述呈現。

## 共用呈現政策

- 主欄只顯示具 `supports` 證據的 `claimOrigin='source'` 資料及繁中翻譯；推論與未確認資料留在預設收合的「更多資訊」。
- 詳情順序固定為主要資訊、相關條目、更多資訊、來源。沒有內容的區段不輸出。
- 附魔主效果依結構化可用性及效果關係呈現；來源支持的效果關係未知時仍同層顯示兩側效果，並標示未確認，不推成不可用或同效。facts 按資料庫 `position` 排序。
- 內建附魔 icon recipe 存於索引 `iconRecipes`，疊圖大小及框樣式由單一 recipe 提供。
