# LLM Wiki 目錄

主題：《Minecraft Dungeons》一代的裝備與附魔。規則見 [../README.md](../README.md)，過程紀錄見 [log.md](log.md)。

## 原始來源（raw）

| ID | 檔案 | 來源頁 |
|---|---|---|
| R1 | [01-item.md](../raw/01-item.md) | Dungeons:Item（oldid 3786240） |
| R2 | [02-weapon.md](../raw/02-weapon.md) | Dungeons:Weapon（oldid 3873343） |
| R3 | [03-armor.md](../raw/03-armor.md) | Dungeons:Armor（oldid 3873342） |
| R4 | [04-artifact.md](../raw/04-artifact.md) | Dungeons:Artifact ＋ 官方神器介紹 |
| R5 | [05-enchantment.md](../raw/05-enchantment.md) | Dungeons:Enchantment（oldid 3899779） |
| R6 | [06-consumable.md](../raw/06-consumable.md) | Dungeons:Consumable |
| R7 | [07-enchanted-mobs.md](../raw/07-enchanted-mobs.md) | Dungeons:Enchanted ＋ Daily Trial |

## 概念頁（wiki）

| ID | 頁面 | 一句話 | 用到的 raw |
|---|---|---|---|
| W1 | [overview.md](overview.md) | 遊戲是什麼、裝備欄、收錄規模 | R1–R6 |
| W2 | [equipment-types.md](equipment-types.md) | 近戰、遠程、盔甲；固有特性 vs 附魔 | R1 R2 R3 R5 |
| W3 | [rarity-and-unique.md](rarity-and-unique.md) | 普通／稀有／獨特，橘色特性 | R1 R2 R3 |
| W4 | [enchantments.md](enchantments.md) | 附魔三概念與五個代表附魔 | R5 |
| W5 | [artifacts-and-consumables.md](artifacts-and-consumables.md) | 神器冷卻 vs 消耗品 | R4 R6 |
| W6 | [player-vs-mob.md](player-vs-mob.md) | 同名附魔在怪物身上的差異與來源衝突 | R5 R7 |
| W7 | [glossary.md](glossary.md) | 名詞表 | W2–W6 |

## 簡報對照

[教學簡報](../../slides/index.html) 每一頁左下角會顯示它的來源頁。`tools/check-llm-wiki.mjs` 的 C-04、C-05、C-06 會自動檢查這張表。

| 投影片 | 標題 | Wiki 頁 | raw |
|---|---|---|---|
| 1–2 | 封面、學習目標 | W1 | — |
| 3 | 沒有職業，裝備就是你的職業 | W1 | 〔推論〕 |
| 4 | 到底有多少東西 | W1 | R1–R6 |
| 5 | 近戰、遠程、盔甲 | W2 | R2 R3 |
| 6 | 固有特性 ≠ 附魔 | W2 | R2-6 |
| 7 | 普通、稀有、獨特 | W3 | R2-2 R2-4 |
| 8 | 小測驗 1 | W3 | — |
| 9 | 附魔三概念 | W4 | R5-1~3 |
| 10 | 五個代表附魔 | W4 | R5-4~8 |
| 11 | 神器 vs 消耗品 | W5 | R4 R6 |
| 12 | Critical Hit 玩家 vs 怪物 | W6 | R5-5 R7-2 |
| 13 | 玩家 vs 怪物對照表 | W6 | R5 R7 |
| 14 | 查不到 ≠ 不存在 | W6 | R5 問題段 |
| 15 | 小測驗 2 | W6 | — |
| 16 | 總結 | W7 | — |
| 17 | 附錄：流程 | [workflow](../../docs/llm-wiki-workflow.md) | — |
