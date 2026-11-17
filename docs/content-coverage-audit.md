# Wiki 內容缺漏盤點

盤點日期：2026-11-17

## 範圍與現況

以 docs/sources.md 登錄的 Minecraft Wiki 英文頁面，對照目前圖鑑分類、SQLite facts、描述和附魔效用資料。圖鑑目前有 446 筆：近戰 83、遠程 72、盔甲 73、附魔 124、神器 53、消耗品 29、其他物品 12。

此圖鑑規格收錄 Wiki 物品總表與附魔總表，不是完整遊戲百科。近戰、遠程與盔甲 facts 目前都只有 Type。53 件神器都有 Type，但只有 Death Cap Mushroom 有額外 Cooldown 和 Fixed effects。附魔已列玩家及怪物效用、可用性和可信度；目前沒有獨立的階級成本、疊加規則或內建裝備欄位。

## 條目內的高價值缺漏

| 優先 | Wiki 資料 | 圖鑑缺少的內容與例子 |
| --- | --- | --- |
| 高 | 裝備的取得任務、古代狩獵符文、武器連段、靈魂附魔資格、DLC 限定與家族關係 | 武器與盔甲總表列有這些資料。Diamond Sword 屬於 Sword 家族，連段長度 3，內建 Sharpness，並列出掉落任務及 Rune I；圖鑑目前沒有相關 facts。[武器總表](https://minecraft.wiki/w/Dungeons%3AWeapon) |
| 高 | 神器靈魂需求、取得任務、古代狩獵符文與 DLC 限定 | Artifact 表含這些欄位。Death Cap Mushroom 有 30 秒冷卻及固定效果，但圖鑑缺取得任務及 Rune I；Updraft Tome 的 Wiki 頁列 12 秒冷卻、任務與 Rune A，圖鑑目前只列 Type。[神器總表](https://minecraft.wiki/w/Dungeons%3AArtifact) |
| 高 | 食物與藥水的取得方式、觸發來源、持續時間及效果計算 | Bread 的描述已記恢復 100% 生命、持續 30 秒；Wiki 另列怪物／箱子掉落、Supply Chest 保證提供、Food Reserves 產生機率、手冊引文、音效及加入版本。[Bread](https://minecraft.wiki/w/Dungeons%3ABread) Strength Potion 的圖鑑描述只有「短暫提升攻擊傷害」；Wiki 另列 30 秒效果、特定盔甲延長至 39 秒，以及與 Shadow Form 合併的傷害公式。[Strength Potion](https://minecraft.wiki/w/Dungeons%3AStrength_Potion) [Shadow Brew](https://minecraft.wiki/w/Dungeons%3AShadow_Brew) |
| 高 | 附魔逐階效果、點數成本、是否可疊加、內建裝備 | Power 的 Wiki 條目列出 +10%／+21%／+33% 傷害、1／2／3 點成本及內建弓；圖鑑的 Power 效果只有文字描述。通用附魔頁另列普通、強力、鍍金裝備成本與重複觸發計算。[Power](https://minecraft.wiki/w/Dungeons%3APower) [附魔機制](https://minecraft.wiki/w/Dungeons%3AEnchanting) |
| 中 | 效果的逐階數值與條目軼事 | Regeneration 已記錄怪物避開傷害 10 秒後開始回血，但未列 I／II／III 階每秒恢復最大生命 0.8%／1.0%／1.2%，也未列 Wiki 所述「怪物專用但保留英雄用圖標與階級」的背景。[Regeneration](https://minecraft.wiki/w/Dungeons%3ARegeneration) |
| 中 | 版本更新紀錄、引文、音效、資料值與內部 ID | 武器總表記錄 1.6.0.0 將 Pickaxe、Diamond Pickaxe 攻擊延遲由 0.45 調至 0.7、傷害由 75 調至 130。Bread 條目另有手冊引文與音效 ID。圖鑑目前沒有歷史、引文或音效欄位。[武器總表](https://minecraft.wiki/w/Dungeons%3AWeapon) [Bread](https://minecraft.wiki/w/Dungeons%3ABread) |

## 數值與資料邊界

Wiki 的 Damage 頁提供基礎傷害、傷害區間與傷害加成資料，但未找到可靠的通用 Power Level 傷害換算公式；Wiki 討論頁也有人指出該公式未見於資料中。不可自行推算或補造。現行資料契約明確省略物品等級及隨裝備強度變動的數值，神器持續時間亦不收錄。若要展示逐等級數值，須先修訂這項規格，並保留 Wiki 的數值波動警示。[Damage](https://minecraft.wiki/w/Dungeons%3ADamage) [Damage 討論頁](https://minecraft.wiki/w/Dungeons_talk%3ADamage) [資料契約](specs/content-contract.md)

## 尚無對應分類的 Wiki 主題

這些是整個遊戲百科的範疇，超出目前物品／附魔圖鑑的規格：

- Ancient 與 Ancient Hunt：Ancient 清單、符文組合、祭品規則、掉落裝備、更新紀錄與軼事。[Ancient](https://minecraft.wiki/w/Dungeons%3AAncient) [Ancient Hunt](https://minecraft.wiki/w/Dungeons%3AAncient_Hunt) [Ancient Offering](https://minecraft.wiki/w/Dungeons%3AAncient_Offering)
- 任務、關卡與難度：任務清單、子地城、秘密任務解鎖、推薦 Power Level、威脅等級與怪物傷害倍率。[Mission](https://minecraft.wiki/w/Dungeons%3AMission) [Difficulty](https://minecraft.wiki/w/Dungeons%3ADifficulty)
- 生物與成就：生物行為和掉落、成就條件及實際達成要求。[Mob](https://minecraft.wiki/w/Dungeons%3AMob) [Achievement](https://minecraft.wiki/w/Dungeons%3AAchievement)
- 等級與經驗：經驗需求公式、升級與等級資訊。[Level](https://minecraft.wiki/w/Dungeons%3ALevel)

## 建議順序

先補裝備／神器取得地點與 Ancient Hunt 符文、附魔階級數值與成本、食物及藥水持續時間和效果。之後再考慮歷史、軼事、引文、音效與內部 ID。新增 Ancient、任務、生物或成就分類須另行擴大產品範圍。
