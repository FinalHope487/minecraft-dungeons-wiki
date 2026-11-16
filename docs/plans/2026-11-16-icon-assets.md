# 圖標素材登錄與 Extra damage 更新

## 目標與狀態

**狀態：已完成（ChatGPT 獨立審查通過）**。依 [圖標素材規範](../specs/icon-assets.md) 統一所有圖標類型的來源、語意 ID、路徑解析與載入方式，並將 Diamond Sword 的 `hex` ID 改為遊戲資產名 `unique-bullet`。使用者已指定直接採用 Wiki 目前提供的最新版圖檔，不需與舊圖比對。

驗收條件：

- 裝備、附魔、固有屬性及共用分類／關聯都有同一套可查核的 ID 與路徑規則。
- Extra damage 使用 Wiki 目前提供的橘色菱形徽記；資料引用 `unique-bullet`，無 `hex` 副檔名特例。
- 建置能辨識缺少登錄或檔案的圖標，GitHub Pages 的相對資產路徑和圖片延遲載入仍可運作。

## 改動邊界

- 修改 `content/catalog.sqlite` 的特性圖標 ID，不改 SQLite schema 或 JSON 公開 schema。
- 新增 `src/icon-assets.mjs`，供瀏覽器和建置器共用圖標 ID、類型及檔名。
- 將 `assets/hex.png` 改名為 `assets/unique-bullet.png`，圖像像素不重畫。
- 更新規格、來源表、設計說明和現有契約斷言。

## 步驟與驗證

1. 記錄最終版本基準與圖標類型規則，更新內容契約。
2. 建立共用登錄表，改用它解析頁面與建置器中的圖標路徑。
3. 更名素材並更新 SQLite 特性 ID，重新建置靜態 JSON。
4. 執行 `npm run build`，確認分類、條目與圖標檔案都可解析；檢查輸出及工作樹。
5. Codex with ChatGPT 依規範審查 ID、來源及本次實際圖像；需先確認工作區 ID，並在 Project 模式保存 Project URL 與 connector 名稱。

## 切換與回退

此改動不變更 schemaVersion；回退時把特性 ID 改回 `hex`、檔案名改回 `hex.png`，並還原登錄與規格即可。圖像像素不變。

## 執行結果

- `npm run build` 通過：輸出 4 個分類、6 筆條目；根目錄 `data/` 與 `dist/data/` 的 Diamond Sword JSON 都使用 `unique-bullet`。
- 先前只把 `assets/hex.png` 更名為 `assets/unique-bullet.png` 時，沿用的是 2,200 bytes 舊素材；2026-11-16 的 Wiki 來源更新已用 Wiki 目前提供的檔案取代，不再沿用該圖。
- 已在瀏覽器確認 [物品總覽](https://minecraft.wiki/w/Dungeons%3AItem)、[武器](https://minecraft.wiki/w/Dungeons%3AWeapon)、[盔甲](https://minecraft.wiki/w/Dungeons%3AArmor)、[神器](https://minecraft.wiki/w/Dungeons%3AArtifact)、[附魔](https://minecraft.wiki/w/Dungeons%3AEnchantment) 彙整頁，以及 Sword、Diamond Sword、Bow、Hunter's Armor、Sharpness、Swirling、Death Cap Mushroom 項目頁。以 Chrome 開啟 Sword 條目，按媒體檢視器的下載，再按 Wiki 的 Download，`MCD_Sword.png` 成功下載，尺寸 512×512、29,998 bytes，確認為透明背景武器圖。
- 新增 `npm run icons:sync` 按需同步命令及 `tools/sync-wiki-icons.mjs`。腳本核對每個檔案仍列在對應條目，再從 Wiki API 取目前圖檔 URL，檢查 HTTPS Wiki 網域、PNG MIME／簽名與大小限制，先暫存七個檔案後更新素材及來源 manifest。`npm run icons:sync -- --dry-run` 只查來源 metadata，不下載、不改檔。
- `npm run icons:sync` 已成功同步 7 個 PNG；`node --check tools/sync-wiki-icons.mjs` 通過；逐一重算本機 SHA-1 與下載大小，皆符合 `docs/wiki-icon-sync.json` 的 `downloadedSha1`／`downloadedBytes`；`npm run build` 通過，輸出 4 個分類、6 筆條目。
- 新增 `npm run icons:sync:dry-run`；執行成功，查詢七筆 Wiki 來源但沒有改動 `docs/wiki-icon-sync.json`。另一次 npm 參數轉送測試沒有把 `--dry-run` 傳入原同步命令，因此改用獨立 npm script，避免使用者誤觸實際同步。
- Wiki API 的瀏覽器端點為 `https://minecraft.wiki/api.php`；`/w/api.php` 會被重寫成無效頁面。Imageinfo 的原檔大小／SHA-1 和 Wiki 圖檔 URL 的下載回應在本次同步中不同，因此 manifest 分欄記錄兩組值，不把 API metadata 誤寫成實際落地檔案的雜湊。依使用者指定，不拿下載檔與舊圖做比對。
- 本輪沒有執行完整 `npm test`；已驗證使用者要求的同步流程、腳本語法、下載檔紀錄及建置。ChatGPT 以正確的 workspace ID 完成唯讀審查並回覆 `DONE — PASS_WITH_NOTES`：七個 PNG、登錄表與來源紀錄一致，沒有阻擋驗收的問題。非阻擋事項：同步失敗時逐檔更新可能留下部分新檔與舊 manifest；Wiki 原檔 metadata 與下載回應不同，兩者已分欄記錄且依使用者指示不比對舊圖；公開部署前需確認七個圖檔的再發布授權。C2C Project URL 與 connector 名稱已持久保存，驗證 `projectReady=true`，完成後 checkpoint 為 `DONE`。
