# 素材與資料來源

## Minecraft Wiki 彙整入口

| 類別 | 一頁式彙整頁 | 頁面內容 |
| --- | --- | --- |
| 全部物品 | [Dungeons:Item](https://minecraft.wiki/w/Dungeons%3AItem) | 近戰武器、遠程武器、盔甲、神器、消耗品與其他物品。 |
| 武器 | [Dungeons:Weapon](https://minecraft.wiki/w/Dungeons%3AWeapon) | 同一頁整理近戰與遠程武器清單及各項屬性。 |
| 盔甲 | [Dungeons:Armor](https://minecraft.wiki/w/Dungeons%3AArmor) | 盔甲清單、固定特性與分類。 |
| 神器 | [Dungeons:Artifact](https://minecraft.wiki/w/Dungeons%3AArtifact) | 神器清單，依用途分類。 |
| 消耗品 | [Dungeons:Consumable](https://minecraft.wiki/w/Dungeons%3AConsumable) | 食物、藥水、彈藥和其他任務消耗品。 |
| 其他物品 | [Dungeons:Consumable](https://minecraft.wiki/w/Dungeons%3AConsumable) | 消耗品總表中的 Other 子類；本圖鑑獨立列為分類。 |
| 附魔 | [Dungeons:Enchantment](https://minecraft.wiki/w/Dungeons%3AEnchantment) | 近戰、遠程、盔甲、特殊與未使用附魔清單。 |

查找時先從這些整頁入口進入，再開對應項目條目；專案記錄頁面連結，不以單張圖片 URL 作為唯一來源。Wiki 頁面取得的圖檔依使用者指示視為該 Wiki 目前最新版，不另與舊圖逐位元比對。

神器清單依 [Dungeons:Artifact](https://minecraft.wiki/w/Dungeons%3AArtifact) 各分類表格逐列核對，包含未使用區。該頁文字統計寫 46 件，但表格列出 45 件已實裝或季節限定神器及 8 件未使用神器；[Dungeons:Item](https://minecraft.wiki/w/Dungeons%3AItem) 的具名清單也列 44 件加 Corrupted Pumpkin 與 8 件未使用項目。本專案以具名表格和清單為準，固定收錄 roster 見 [`tests/fixtures/wiki-item-roster.json`](../tests/fixtures/wiki-item-roster.json)。消耗品依 [Dungeons:Consumable](https://minecraft.wiki/w/Dungeons%3AConsumable) 的 Food、Potions、Ammo、Other 區段逐項核對；圖鑑將 Other 子類放入「其他物品」，其餘三類依序排在「消耗品」中。

| 條目 | 來源 | 核對狀態 |
| --- | --- | --- |
| Sword | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3ASword) | 版本與英文原文仍待正本遊戲截圖確認。 |
| Diamond Sword | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3ADiamond_Sword) | 已定位英文說明、Unique、Extra damage 與 Sharpness 的對照；Wiki 圖檔已同步，當前檔名及上傳時間見 `wiki-icon-sync.json`。 |
| Sharpness | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3ASharpness) | 使用機制摘要。 |
| Swirling | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3ASwirling) | 使用觸發條件及機制摘要。 |
| Bow | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3ABow) | 一代條目圖檔已同步；依使用者指示採用 Wiki 當前檔案，不與舊圖比對。 |
| Hunter's Armor | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3AHunter%27s_Armor) | 一代條目圖檔已同步；依使用者指示採用 Wiki 當前檔案，不與舊圖比對。 |
| Death Cap Mushroom | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3ADeath_Cap_Mushroom)、[神器總表](https://minecraft.wiki/w/Dungeons%3AArtifact)、[Minecraft 官方神器介紹](https://www.minecraft.net/en-us/article/minecraft-dungeons--9-essential-artifacts) | 一代神器首筆樣本。核對遊戲內描述、30 秒冷卻、固定攻擊速度與移動速度效果；持續時間隨物品強度變動，不納入展示。繁中名稱與描述為圖鑑翻譯。圖標從項目頁同步。 |
| TNT | [消耗品總表](https://minecraft.wiki/w/Dungeons%3AConsumable)、[Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3ATNT) | 遊戲內投擲消耗品；採用條目所列遊戲描述。繁中名稱與描述為圖鑑翻譯。 |
| Mystery Banner | [物品總覽](https://minecraft.wiki/w/Dungeons%3AItem)、[消耗品總表](https://minecraft.wiki/w/Dungeons%3AConsumable)、[Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3AMystery_Banner) | Wiki Other 子類中的任務消耗品；頁面歷史記載於 1.9.1.0 加入。繁中名稱與描述為圖鑑翻譯。 |
| Anchor | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3AAnchor) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Axe | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3AAxe) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Backstabber | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3ABackstabber) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Battlestaff | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3ABattlestaff) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Boneclub | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3ABoneclub) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Broken Sawblade | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3ABroken_Sawblade) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Claymore | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3AClaymore) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Coral Blade | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3ACoral_Blade) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Cutlass | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3ACutlass) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Daggers | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3ADaggers) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Double Axe | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3ADouble_Axe) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Gauntlets | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3AGauntlets) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Glaive | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3AGlaive) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Great Hammer | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3AGreat_Hammer) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Katana | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3AKatana) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Mace | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3AMace) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Obsidian Claymore | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3AObsidian_Claymore) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Pickaxe | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3APickaxe) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Rapier | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3ARapier) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Sickles | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3ASickles) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Soul Knife | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3ASoul_Knife) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Soul Scythe | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3ASoul_Scythe) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Spear | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3ASpear) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Tempest Knife | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3ATempest_Knife) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Void Touched Blades | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3AVoid_Touched_Blades) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |
| Whip | [Minecraft Wiki](https://minecraft.wiki/w/Dungeons%3AWhip) | Common / Rare 與英文遊戲原文；繁中為圖鑑翻譯。圖標依該項目頁同步。 |

| Wiki 圖標素材 | 來源 |
| --- | --- |
| `sword.png`、`diamond-sword.png`、`bow.png`、`hunters-armor.png` | 各自使用 [Sword](https://minecraft.wiki/w/Dungeons%3ASword)、[Diamond Sword](https://minecraft.wiki/w/Dungeons%3ADiamond_Sword)、[Bow](https://minecraft.wiki/w/Dungeons%3ABow)、[Hunter's Armor](https://minecraft.wiki/w/Dungeons%3AHunter%27s_Armor) 條目的圖標檔。Wiki 檔名與實際同步時間記在 [`wiki-icon-sync.json`](wiki-icon-sync.json)。 |
| `sharpness.png`、`swirling.png` | 各自使用 [Sharpness](https://minecraft.wiki/w/Dungeons%3ASharpness)、[Swirling](https://minecraft.wiki/w/Dungeons%3ASwirling) 附魔條目的圖標檔；檔名與同步時間見 [`wiki-icon-sync.json`](wiki-icon-sync.json)。 |
| `unique-bullet.png` | 使用 [Diamond Sword](https://minecraft.wiki/w/Dungeons%3ADiamond_Sword) 頁面 `Extra damage` 列的 `DungeonsMiscellaneousSprite unique-bullet.png`；同步時間見 [`wiki-icon-sync.json`](wiki-icon-sync.json)。 |
| `regular-bullet.png` | 使用 [Dungeons:Weapon](https://minecraft.wiki/w/Dungeons%3AWeapon) 總表中普通武器效果的 `DungeonsMiscellaneousSprite regular-bullet.png`；同步時間見 [`wiki-icon-sync.json`](wiki-icon-sync.json)。 |
| `death-cap-mushroom.png` | 使用 [Death Cap Mushroom](https://minecraft.wiki/w/Dungeons%3ADeath_Cap_Mushroom) 項目頁的一代主圖 `Death Cap Mushroom (MCD).png`；同步時間見 [`wiki-icon-sync.json`](wiki-icon-sync.json)。 |
| `tnt.png`、`mystery-banner.png` | 各自使用 [TNT](https://minecraft.wiki/w/Dungeons%3ATNT)、[Mystery Banner](https://minecraft.wiki/w/Dungeons%3AMystery_Banner) 條目的圖標檔；檔名與同步時間見 [`wiki-icon-sync.json`](wiki-icon-sync.json)。 |
| 神器、消耗品與其他物品圖標 | 以 Wiki 條目頁的主圖或 `DungeonsItemSprite` 單品圖標為來源；若兩者皆無，使用 [`DungeonsMiscellaneousSprite ?`](https://minecraft.wiki/w/Template%3ADungeonsMiscellaneousSprite) placeholder。實際檔名、來源頁與同步雜湊見 [`wiki-icon-sync.json`](wiki-icon-sync.json)。 |
| 圖檔同步方法 | 執行 `npm run icons:sync`。腳本以 Wiki 整頁條目作來源，檢查檔案仍列在條目中，取得目前圖檔 URL 並更新來源清單；不直接把圖片網址當唯一來源，也不與舊圖做位元比對。先預覽可執行 `npm run icons:sync:dry-run`；`wiki-icon-sync.json` 分別記錄 Imageinfo 的上傳 metadata，以及實際下載檔的大小、MIME 與 SHA-1。方法依 MediaWiki 官方 [Images API](https://www.mediawiki.org/wiki/API:Images) 與 [Imageinfo API](https://www.mediawiki.org/wiki/API:Imageinfo)。 |

| 畫面素材 | 來源 |
| --- | --- |
| `inventory-frame.png` | [Diamond Sword 原版遊戲畫面](https://staticg.sportskeeda.com/editor/2021/10/74727-16341531279928-1920.jpg)裁切。 |
| `inventory-background.png`、`unique-frame.png` | `references/images/選單加資訊.png` 的背景與格框裁切。 |
| `game-slot-frame.png` | 裁自 `references/images/選單加資訊.png` 的背包格，去除內部物品與黃色角標，保留雙線斜面。Unique 沿用同一截圖的橘色框，光暈用 CSS 補足。 |
| `empty-inventory-slot.png` | 裁取使用者提供的原版畫面 [inventory-empty-slots.png](../references/images/inventory-empty-slots.png) 第二列中間的完整暗色 X 空格。 |
| 背包與掉落物格的排法 | [Mojang 的預告解析](https://www.minecraft.net/en-us/article/minecraft-dungeons-news)、[遊戲原版 UI 作品集](https://www.behance.net/gallery/125377795/2019-Minecraft-Dungeons-UI-Art)，及 `references/images/橫向選單參考.png`。 |
| `compact-background.png` | `references/images/橫向選單參考.png` 的背景裁切，供改用共用底圖前的畫面對照。 |
| `pixelify-sans.ttf` | [Google Fonts 的 Pixelify Sans](https://github.com/google/fonts/tree/main/ofl/pixelifysans)，用於英文物品名稱及稀有度。專案附有 [SIL Open Font License 1.1](../assets/pixelify-sans-ofl.txt)。 |

一代圖標版本基準採 1.17.0.0：[Mojang 說明 1.17 是《Minecraft Dungeons》最終更新](https://www.minecraft.net/en-us/article/dungeons--25-million-players)，[遊戲資料庫標示採用 1.17.0.0 遊戲檔](https://www.dungeons.tools/weapons/diamond-sword)。

目前素材用於本機預覽。公開發布前依 [Minecraft 使用指南](https://www.minecraft.net/en-us/usage-guidelines) 與參考圖來源確認適用的使用條件。

## 字型

| 字型 | 用途與來源 |
| --- | --- |
| Minecraft Ten v2 | 英文物品標題與橫幅英文小標。原檔來自 [Mojang 官方網站主題](https://github.com/Mojang/web-theme-bootstrap/tree/main/assets/fonts)，[來源專案授權](../assets/fonts/mojang-theme-license.txt)隨檔保留。 |
| Noto Sans Regular／Bold | 英文敘述、屬性及界面文字。取自同一套 [Mojang 官方網站主題](https://github.com/Mojang/web-theme-bootstrap/tree/main/assets/fonts)，隨附 [SIL OFL](../assets/fonts/noto-sans-ofl.txt)。字重為 400、700。 |
| Noto Sans TC | 繁中標題、導覽、按鈕、欄位和說明。未找到可核實為一代遊戲內繁中字型的檔案，採用 [Google Fonts 繁中可變字型](https://github.com/google/fonts/tree/main/ofl/notosanstc)作為替代。保留全字集，以 WOFF2 儲存，隨附 [SIL OFL](../assets/fonts/noto-sans-tc-ofl.txt)。 |

Minecraft Ten v2 和 Noto Sans 可追溯至 Mojang 的網站資產；本輪以一代參考截圖做視覺比對，遊戲客戶端內的字型版本待驗證。
