# R5 · Dungeons:Enchantment（附魔總表）

- 來源：<https://minecraft.wiki/w/Dungeons%3AEnchantment?oldid=3899779>（2026-11-15 修訂）
- 補充項目頁：Sharpness、Critical Hit、Swirling、Fire Aspect、Soul Siphon、Committed、Electrified
- ingest 日期：2026-11-23

## 抽出的事實

| # | 事實 | 核對 |
|---|---|---|
| 1 | 去重後 **124** 個附魔；分區：英雄可用（近戰／遠程／盔甲）、Exclusive、Mob-exclusive、Unused、Enchanter's Tome | catalog `enchantments` 124 ✅ |
| 2 | 附魔有 **I／II／III 三個階級**，階級越高數值越強 | — |
| 3 | 附魔稀有度有「普通」與「強力（Powerful）」兩種 | catalog badge ✅ |
| 4 | Sharpness（近戰）：I／II／III 提高 **10%／21%／33%** 傷害 | audit `supported` ✅ |
| 5 | Critical Hit（近戰＋遠程，強力）：玩家 I／II／III 有 **10%／15%／20%** 機率造成三倍傷害 | audit `supported` ✅ |
| 6 | Swirling（近戰，強力）：連擊最後一擊造成範圍傷害，I／II／III = X／1.5X／2X | ✅ |
| 7 | Fire Aspect：使怪物著火 3 秒持續傷害 | ✅ |
| 8 | Soul Siphon：命中時 20% 機率獲得額外靈魂，I／II／III = 1／3／5 個 | ✅ |
| 9 | 同名附魔可以適用多種裝備（如 Critical Hit 同時屬於近戰與遠程），只算一筆 | ✅ |

## ingest 時發現的問題

- ⚠ Committed：怪物清單說以「英雄生命值」為基準；Committed 條目頁說怪物側和英雄側相同，而英雄側是看「怪物已損失的生命值」。→ 標為 `conflicting_sources`，不選邊。
- ⚠ Electrified：怪物清單寫每 5 秒觸發，條目頁的歷史紀錄寫改成 4 秒。→ 同上。
- Shielding、Synergy：總表自己把怪物可用性標成待查（Verify），保留待查狀態。
