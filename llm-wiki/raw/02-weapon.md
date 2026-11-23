# R2 · Dungeons:Weapon（武器總表）

- 來源：<https://minecraft.wiki/w/Dungeons%3AWeapon?oldid=3873343>
- 補充項目頁：[Sword](https://minecraft.wiki/w/Dungeons%3ASword)、[Diamond Sword](https://minecraft.wiki/w/Dungeons%3ADiamond_Sword)、[Bow](https://minecraft.wiki/w/Dungeons%3ABow)
- ingest 日期：2026-11-23

## 抽出的事實

| # | 事實 | 核對 |
|---|---|---|
| 1 | 同一頁列出近戰（83）與遠程（72）武器及其 Properties（固有特性） | 與 catalog 分類數一致 ✅ |
| 2 | Properties 欄用兩種標記：**Regular Bullet**（灰，普通特性）、**Unique Bullet**（橘，只有 Unique 變體才有） | `docs/specs/icon-assets.md` |
| 3 | Sword：Common／Rare，無固有特性；描述 "A sturdy and reliable blade." | catalog `sword` ✅ |
| 4 | Diamond Sword：Sword 的 Unique 變體，特性 "Extra damage"；描述 "The Diamond Sword is the true mark of a hero and an accomplished adventurer." | catalog `diamond-sword` ✅ |
| 5 | Bow：普通遠程武器，描述提到 Pumpkin Pastures 的獵人 | catalog `bow` ✅ |
| 6 | 部分武器的特性就是一個「內建附魔」（built-in enchantment），在遊戲中以附魔圖示＋橘框顯示 | 117 筆內建附魔關聯，見 `docs/decisions/2026-11-17-built-in-enchantment-trait-placement.md` |

## ingest 時發現的問題

- 內建附魔的圖示要對到「哪一行特性」。117 筆中有 115 筆能自動對上，Anchor 與 Encrusted Anchor 的 Gravity 必須手動指到 "Pulls in enemies" 那一行。
