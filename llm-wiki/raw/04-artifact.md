# R4 · Dungeons:Artifact（神器總表）

- 來源：<https://minecraft.wiki/w/Dungeons%3AArtifact>
- 補充：[Death Cap Mushroom](https://minecraft.wiki/w/Dungeons%3ADeath_Cap_Mushroom)、[Corrupted Pumpkin](https://minecraft.wiki/w/Dungeons%3ACorrupted_Pumpkin)、[Minecraft 官方神器介紹](https://www.minecraft.net/en-us/article/minecraft-dungeons--9-essential-artifacts)
- ingest 日期：2026-11-23

## 抽出的事實

| # | 事實 | 核對 |
|---|---|---|
| 1 | 神器是「主動技能」型道具：按鍵使用、用完進入冷卻（cooldown） | — |
| 2 | 表格列出 45 件已實裝或季節限定神器 + 8 件未使用，共 53 | catalog `artifacts` 53 / 未實裝 8 ✅ |
| 3 | Death Cap Mushroom：冷卻 **30 秒**；效果 **攻擊速度 +100%、移動速度 +20%**；持續時間隨物品強度變動 | catalog facts ✅ |
| 4 | Corrupted Pumpkin 標示為 *Special event item* → 季節限定，但仍屬已實裝 | catalog `seasonal=1, implemented=1` ✅ |

## ingest 時發現的問題

- ⚠ **頁首文字寫 46 件，表格實際是 45 件**（不含未使用）。和 R1 的 44 + Corrupted Pumpkin = 45 吻合。→ 以表格為準。
- 首次抽取的英文描述有 7 筆和各神器頁的 `In-game description` 不符（Corrupted Seeds、Fireworks Arrow、Satchel of Snacks、Scatter Mines、Soul Lantern、Updraft Tome、Vexing Chant），2026-11-17 重新逐頁比對後修正。
