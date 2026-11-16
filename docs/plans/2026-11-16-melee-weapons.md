# 全部非 Unique 近戰武器

## 目標與狀態

**狀態：已完成。** 收錄 Minecraft Wiki 武器總表列出的 27 種 Common / Rare 近戰基礎武器。既有 `sword` 已在資料庫，新增其餘 26 種並保留既有 Unique `diamond-sword`。

清單：Sword、Anchor、Axe、Backstabber、Battlestaff、Boneclub、Broken Sawblade、Claymore、Coral Blade、Cutlass、Daggers、Double Axe、Gauntlets、Glaive、Great Hammer、Katana、Mace、Obsidian Claymore、Pickaxe、Rapier、Sickles、Soul Knife、Soul Scythe、Spear、Tempest Knife、Void Touched Blades、Whip。

規格：[圖鑑公開規格](../spec.md)、[SQLite 資料規範](../specs/catalog-storage.md)、[圖標素材規範](../specs/icon-assets.md)。來源以 [Dungeons:Weapon](https://minecraft.wiki/w/Dungeons%3AWeapon) 整頁總表和各項目頁為準；Wiki 圖檔依使用者指示使用目前提供版本，不和舊檔比對。

## 改動邊界

- `content/catalog.sqlite`：新增 26 筆 `equipment` 條目和 `Melee weapon` 類型欄位；所有新增基礎武器標示 Common / Rare、採 steel 色調，保留 Diamond Sword 的 Unique 標籤與關聯。
- `src/icon-assets.mjs`、`tools/sync-wiki-icons.mjs`：登錄 26 個語意圖標 ID，對應每個項目頁和其中圖標檔名。
- `assets/`、`docs/wiki-icon-sync.json`、`docs/sources.md`：透過既有批次同步腳本下載目前 Wiki 圖檔並保存條目來源和同步紀錄。
- `tests/routes.test.mjs`、`docs/spec.md`：驗證近戰、全部裝備清單及擴充後的驗收數量。

## 步驟與驗證

1. 確認 Wiki 一頁武器總表中基礎武器的 Unique 欄為 No，逐項查核英文原文、Common / Rare 標籤及項目頁。
2. 以交易新增 26 筆 SQLite 條目，保留既有 Sword、Diamond Sword，並將近戰排列在遠程與盔甲之前。
3. 將 26 個圖標加入共用登錄及 Wiki 頁面同步清單；先執行 `npm run icons:sync:dry-run` 確認 API 可在項目頁找到圖檔，再執行 `npm run icons:sync`。
4. 更新來源索引、公開範圍與路由測試。執行 `npm test`、`npm run build`，檢查 32 筆總資料、28 筆近戰及 JSON／圖檔完整性。
5. 以本機預覽確認繁中近戰分類、灰色 Regular Bullet 與橘色 Unique Bullet 的圖標和文字顏色；記錄實際結果。

## 切換與回退

資料庫為唯一內容來源。若核對或建置失敗，停止發布；可在交易中刪除新增 26 筆和相關圖檔登錄，並還原其他裝備的位置。既有 Sword 和 Diamond Sword 不刪除也不改 ID。

## 執行結果

- Wiki 整頁總表和各項目頁完成核對；新增 26 種基礎武器的中英文資料與來源，保留 Sword 和 Unique Diamond Sword。資料庫共 32 筆，其中裝備 30 筆、近戰 28 筆。
- `npm run icons:sync:dry-run` 確認 33 個登錄圖檔均可由項目頁找到；`npm run icons:sync` 成功同步 33 張目前 Wiki PNG，其中 26 張為本次新增，並更新同步 manifest。
- 追加核對 Wiki `Properties` 欄後，為 22 種有 `Regular Bullet` 的基礎近戰武器補上灰色菱形效果與來源；Sword、Katana、Mace、Pickaxe、Soul Scythe 的該欄沒有此效果，維持空白。Diamond Sword 只列橘色 `Extra damage`；其基礎 Sword 沒有灰色效果。其餘 Unique 變體不在本次收錄範圍。
- MediaWiki 圖片 API 曾在 500 張上限截斷 `Dungeons:Weapon` 頁；同步腳本已支援 continuation 分頁。dry-run 找到 `File:DungeonsMiscellaneousSprite regular-bullet.png`，之後成功同步 34 張目前 Wiki PNG（含本次新增灰色屬性圖），manifest 已更新。
- `npm test` 通過（9/9）；`npm run build` 成功（4 類、32 筆）。
- 瀏覽器本機預覽顯示「近戰 28 筆」；錨的 3 條效果文字及灰色菱形正常呈現；Diamond Sword 的 `Extra damage` 與橘色菱形也正常呈現。英文介面與第二種版型未在此輪瀏覽器中另行核對；不把這兩項記為已驗證。
- ChatGPT 協作規劃未送出：C2C 連線健康檢查未達 Skill 規定的安全就緒狀態，故依規定未繞過檢查。
