# Wiki 內容缺漏盤點

盤點日期：2026-11-18

## 範圍與現況

以 docs/sources.md 登錄的 Minecraft Wiki 英文頁面，對照目前圖鑑分類、SQLite facts、描述和附魔效用資料。圖鑑目前有 446 筆：近戰 83、遠程 72、盔甲 73、附魔 124、神器 53、消耗品 29、其他物品 12。

此圖鑑規格收錄 Wiki 物品總表與附魔總表，不是完整遊戲百科。近戰、遠程與盔甲 facts 目前都只有 Type。53 件神器都有 Type，但只有 Death Cap Mushroom 有額外 Cooldown 和 Fixed effects。附魔已列玩家及怪物效用、可用性和可信度；階級成本、疊加規則仍未收錄。117 筆武器內建附魔關聯記錄階級、Bullet 類型與對應特性列。

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

## 武器內建附魔階級與圖標盤點

盤點基準：`tests/fixtures/wiki-gear-roster.json` 列出 155 件近戰與遠程武器；104 件有內建附魔，共 117 筆武器至附魔關聯、51 種附魔。`tests/fixtures/wiki-built-in-enchantment-markers.json` 逐筆預期圖標底圖與階級；schema v5 關聯 metadata 明確連至對應 Bullet 特性列，公開 JSON 輸出該列索引。

目前已查證的階級例外有兩個：Guardian Bow 的 Supercharge 為 II 級，[Supercharge](https://minecraft.wiki/w/Dungeons%3ASupercharge)；Nautical Crossbow 的 Piercing 為 III 級，[Piercing](https://minecraft.wiki/w/Dungeons%3APiercing)。Wiki 對這兩把武器也明確指出其階級例外：[Guardian Bow](https://minecraft.wiki/w/Dungeons%3AGuardian_Bow)、[Nautical Crossbow](https://minecraft.wiki/w/Dungeons%3ANautical_Crossbow)。一般附魔頁會列出各武器的內建階級，例如 Sharpness、Gravity、Critical Hit、Echo、Freezing 和 Rushdown 頁均標出 I 級。

10 筆關聯使用沒有階級的 Exclusive 效果：Jungle Poison 2 筆、Shared Pain 1 筆、Reliable Ricochet 2 筆、Shadow Shot 3 筆、Shadow Barb 2 筆。它們不能標成 I 級。Wiki 說內建附魔在裝備屬性列以附魔圖標加橘色邊框顯示；圖鑑目前的 trait 另以 Regular Bullet 或 Unique Bullet 表示效果種類。[附魔總表與內建附魔說明](https://minecraft.wiki/w/Dungeons%3AEnchantment)

同一把 Unique 武器可同時有 Regular Bullet 與 Unique Bullet 效果，內建附魔可能對應其中任一效果。Minecraft Wiki 說內建附魔均以原附魔圖標加橘色邊框顯示，未列 Regular／Unique 例外；本圖鑑保留 Bullet 底圖，再疊上橘框附魔原圖標。依 117 筆關聯逐一比對屬性文字，97 筆使用 Unique Bullet、20 筆使用 Regular Bullet；105 筆為 I 級、Guardian Bow 的 Supercharge 為 II 級、Nautical Crossbow 的 Piercing 為 III 級；10 筆 Exclusive 效果無階級。執行資料及可重跑 SQL 見 [v3→v4 migration](../content/migrations/v3-to-v4-built-in-enchantment-markers.sql) 與 [v4→v5 migration](../content/migrations/v4-to-v5-built-in-enchantment-trait.sql)。Call of the Void 單品頁將傷害倍數效果標 Unique，武器總表標 Regular；依專案規則採總表，修正 trait 並標記 Void Strike 關聯為 Regular。[武器總表](https://minecraft.wiki/w/Dungeons%3AWeapon) [附魔總表](https://minecraft.wiki/w/Dungeons%3AEnchantments) [Call of the Void](https://minecraft.wiki/w/Dungeons%3ACall_of_the_Void)

## Ambush 詳情頁事實與判讀

盤點基準：Minecraft Wiki 的 [Ambush](https://minecraft.wiki/w/Dungeons%3AAmbush)、[Enchanted Mobs](https://minecraft.wiki/w/Enchanted_Mobs)、[Daily Trial](https://minecraft.wiki/w/Dungeons%3ADaily_Trial) 與[附魔總表](https://minecraft.wiki/w/Dungeons%3AEnchantments)。

| 頁面資訊 | 來源性質 | 說明 |
| --- | --- | --- |
| 名稱 Ambush、Common、Melee Weapon；Hero-accessible 分類 | Wiki 明載；繁中為翻譯 | Ambush 頁直接列出名稱、稀有度與適用類別；附魔總表將 Ambush 列在 Hero-accessible 的 Melee 區段。 |
| 玩家效果 | Wiki 原文；繁中為翻譯 | In-game description 寫明攻擊未主動鎖定玩家的怪物會增加傷害。 |
| 怪物效果 | Wiki 原文；繁中為翻譯，來源標 `[verify]` | Enchanted Mobs 寫 `Mob inflicts extra damage on unsuspecting heroes.`；待查標記也必須保留。中文應譯為「怪物會對未察覺的英雄造成額外傷害」，不能改成「尚未鎖定英雄」。 |
| 固有效果裝備 Backstabber、Swift Striker 與階級 I | Wiki 明載；關聯提示為圖鑑翻譯 | Ambush 頁的 Built-into 區段直接列出這兩件武器及 Tier I。 |
| 英雄附魔槽可用 | Wiki 明載後整理成欄位 | Ambush 頁稱它可能出現在近戰武器的任一附魔槽；「一般裝備附魔選項」是圖鑑摘要。 |
| 怪物可用性 | 多個 Wiki 頁面記載互有衝突 | Ambush 頁與 Daily Trial 頁列出怪物可用情境；附魔總表的怪物可用性欄標「✖」；Enchanted Mobs 頁將神秘旗幟下的怪物效果標為 `[verify]`。應在「更多資訊」逐項呈現，不合併為單一確定結論。 |
| Audience：Player and mob | 圖鑑判讀 | 由玩家側與怪物側來源資料歸納；Wiki 沒有提供此欄作為明確結論。 |
| Evidence confidence：Low | 圖鑑可信度判斷 | 根據怪物效果的 `[verify]` 標記及怪物可用性來源衝突評為低；不是 Wiki 給出的評級。 |
| 已實裝 | 圖鑑狀態分類 | Wiki 條目明載可在近戰武器附魔槽出現；`implemented` 是本圖鑑資料欄，不是 Wiki 原文欄位。 |
| 非 Seasonal | 由清單標記狀態判定 | Wiki 沒有在此頁明載「非季節限定」；本圖鑑未發現季節標記，因此 `seasonal=false` 是目錄分類，不是原文。 |
| 英文原文、相關條目、來源連結 | Wiki 原文或引用資料 | 英文效果原文置於收合的「更多資訊」；Backstabber 與 Swift Striker 列於相關條目；來源連結置於整個詳情最後。 |

## 其他逐筆來源對應

| Fact | 支持來源 | 查核內容 |
| --- | --- | --- |
| Critical Hit `player_effect`、`mob_effect` | [Critical Hit](https://minecraft.wiki/w/Dungeons%3ACritical_Hit) | 條目逐級列出玩家 10%／15%／20% 機率；同頁 Usage 明載怪物必定造成三倍傷害。 |
| Freezing `player_effect` | [Freezing](https://minecraft.wiki/w/Dungeons%3AFreezing) | 條目明載玩家命中後使怪物緩速三秒。 |
| Freezing `mob_effect` | [Enchanted Mobs](https://minecraft.wiki/w/Dungeons%3AEnchanted_Mobs) | 附魔怪物條目明載攻擊英雄會降低英雄攻擊速度。 |
| Burning `player_effect` | [Burning](https://minecraft.wiki/w/Dungeons%3ABurning) | 條目明載每 0.5 秒傷害附近敵人。 |
| Burning `mob_effect` | [Enchanted Mobs](https://minecraft.wiki/w/Dungeons%3AEnchanted_Mobs) | 附魔怪物條目明載怪物會持續傷害附近英雄。 |

顯示順序：主資料與來源明載效果、相關條目、預設收合的「更多資訊」（Wiki 原文、跨頁衝突與圖鑑判讀）、來源連結。不同的玩家／怪物效果同層級呈現；Wiki 標 `[verify]` 時在效果旁保留註記。決策見[附魔詳情層級](decisions/2026-11-18-enchantment-detail-information-hierarchy.md)。

## 124 筆附魔的效果來源稽核

盤點紀錄：[附魔效果來源稽核](audits/enchantment-effect-facts.json)，逐筆列出 253 個玩家／怪物效果 fact 及 124 個效果關係，含固定 Wiki 修訂、支持摘錄、來源判定和可信度。共有 169 個效果 fact 為來源支持、83 個為推論、1 個未知；效果關係為相同 7、不同 12、未知 105。效果關係是圖鑑依來源文字所作比較，UI 在收合的「更多資訊」標成圖鑑判讀。

Leeching、Sharpness、Double Damage、Fast Attack、Quick 各保留舊複合 claim 與 fact ID，標為推論並收在「更多資訊」；另拆出 5 筆由 Enchanted Mobs 頁逐句支持的純怪物效果 facts，供主要效果顯示與比較。原文中混合的怪物適用範圍、歷史或施加途徑仍由各自欄位記錄，不再冒充單一效果原文。

Wiki 未直接描述效果時，稽核標示在已查閱頁面未找到，不推成不可用。Ambush、Stunning 等 `[verify]` 標記照錄；Committed 與 Electrified 保留跨頁衝突；Jungle Poison 的怪物中毒效果不再當成 Wiki 明載。Ambush 的怪物效果雖有來源句子，但 Wiki 標為 `[verify]`，因此效果關係保留未知。Bonus Shot、Freezing、Radiance、Ricochet、Frenzied、Burning、Chilling、Rush、Tempo Theft、Chain Reaction、Multishot、Poison Cloud、Fuse Shot、Chains、Deflect、Echo 共 16 筆的來源沒有提供足夠細節比較完整效果，例如觸發條件、機率、頻率或持續時間；其中 Frenzied 怪物側另有玩家側未列的 50% 數值。這些關係維持未知，並在主欄保留雙側有來源支持的效果。所有結果均非遊戲內實測。
