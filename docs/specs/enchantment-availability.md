# 附魔玩家與怪物效用

## 詳情欄位

124 筆附魔的詳情都必須提供下列雙語欄位：

| 欄位 | 用途 |
| --- | --- |
| `Audience` | 區分玩家、怪物、兩者、未使用及未確認。 |
| `Hero availability` | 說明英雄能否從裝備附魔選項取得；固有附魔與附魔師之書分開描述。 |
| `Player effect` | 描述英雄持有裝備或取得增益時的效果；保留觸發條件與階級數值。 |
| `Mob availability` | 說明怪物來源及種類，包含一般附魔怪物、試煉、遠古生物與季節試煉。 |
| `Mob effect` | 只描述效果在怪物身上時的行為；不得直接複製英雄效果並假設機制相同。 |
| `Evidence confidence` | 說明判定可信程度及未實測限制。 |

原始 `description` 保留 Wiki 遊戲內描述，但附魔詳情改由 `Player effect` 顯示，避免同一段文字重複。

## 判定與來源

- 以 [附魔總表](https://minecraft.wiki/w/Dungeons%3AEnchantment)、[附魔怪物](https://minecraft.wiki/w/Dungeons%3AEnchanted)、[每日試煉](https://minecraft.wiki/w/Dungeons%3ADaily_Trial) 及各附魔條目頁互相比對。
- `high` 表示 Wiki 明確列出可用對象及效果；`medium` 表示由總表、怪物清單或未列出項目推斷；`low` 表示來源互相衝突、Wiki 標為待查，或怪物效果未有說明。
- 來源沒有列出的效果不得自行補成確定事實。將怪物效果寫為未列出／未確認，降低可信度並保留具體來源。
- Wiki 資料不等於遊戲內實測。未實際驗證的機制必須在可信度欄明示。
- 每筆附魔保留總表、具體條目頁及適用的怪物、試煉或未使用內容來源。

## 驗收條件

- `tests/fixtures/wiki-enchantment-roster.json` 中每筆都具有完整 `availability` 稽核資料；其玩家、怪物效果、可信度及來源與 SQLite `facts`、`entry_sources` 一致。
- 詳情呈現全部六個雙語欄位，且不再額外重複顯示附魔 `description`。
- Critical Hit 明確區分玩家 I／II／III 階的 10%／15%／20% 機率與怪物必定造成三倍傷害。
- Thorns、Protection、Thundering 等 Wiki 有明確差異的附魔保留兩側數值或觸發條件；來源衝突項目維持低可信度。
- `npm test`、`npm run build` 通過；直接檢查本地 `dist/` 輸出，不開瀏覽器。
