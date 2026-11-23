<!--
本專案專屬規則：規則檔的通用規則在本專案代入的值。
放：專案目錄、各層驗證指令、真依賴與替身、開發服務埠、專案專屬工具的執行方式。新增內容時列出命名、位置、必填欄位、可仿作範例、索引更新方式，以及應跑的驗證指令。
不放：通用規則（寫規則檔）、測試數字（寫 commit message）、決策（寫 DECISIONS.md）、公開契約與驗收（寫 docs/spec.md）、專案現況（寫 STATE.md）。
與規則檔衝突時以規則檔為準，並修正這份。
-->

## 專案目錄與驗證

- `docs/spec.md` 記錄站點規格、兩種展示版型與驗收方式。
- `references/images/` 存放設計參考圖片。
- `index.html` 與 `src/` 是網站入口和版型。共用資料在 `content/catalog.sqlite`，資料表與編輯方式見 [SQLite 圖鑑資料庫規範](specs/catalog-storage.md)，圖標與背景來源見 [素材與資料來源](sources.md)。
- 依 [內容契約](specs/content-contract.md) 編輯 SQLite。新增分類須登記分類、圖示與首筆資料。用小寫連字號 ID，連結到現有條目並附來源。
- 新增物品依下方[查找與收錄流程](#查找與收錄流程)從 Wiki 彙整頁查到具體項目頁，先核實條目與效果，再更新 SQLite 條目、`icon_assets`、來源與驗收測試。
- 建立條目關聯時，若已查證的直接關聯目標尚未收錄，且符合本輪圖鑑範圍，應在同一輪查找、核實並建立該目標條目，再建立關聯。只新增這筆關聯直接指向的條目，不沿著新條目繼續擴展關聯。目標不符合收錄範圍或無法查證時，不建立條目或關聯。
- 驗收先跑 `npm test` 與 `npm run build`，再直接檢查 `dist/index.html`、`dist/src/`、`dist/data/` 和 `dist/assets/`。不啟動預覽伺服器或瀏覽器；無法由建置產物與測試證明的畫面行為，記為未驗證。
- 從 repo 根目錄以 Python 3 執行 `python tools/outline.py <檔案>`，可列出 Markdown 標題。
- 每輪完成物品欄或詳情顯示變更後，透過 Codex with ChatGPT 請 GPT 對照 `docs/spec.md`、原版參考圖及本地建置產物，審查整體物品欄與顯示結構，記錄結果及未解差異。不得把靜態檢查描述成已驗證實際渲染。

## 查找與收錄流程

1. **先找整頁清單，再逐項查頁面。** 從 [`docs/sources.md`](sources.md) 的 Minecraft Wiki 彙整入口開始，按本輪範圍選武器、盔甲、神器、附魔或全部物品頁；在彙整頁核對清單與分類，之後打開每個條目的《Minecraft Dungeons》一代項目頁核對名稱、稀有度及英文描述。神器加入時新增獨立分類，設定 `group_key='equipment'`，讓神器同時出現在神器分類與「全部裝備」。不要用圖片 URL 代替項目頁，也不要混入《Dungeons II》資料。
2. **分開記錄描述與固有效果。** 項目頁的說明文放 `description`；彙整頁 `Properties` 欄的效果放 `traits`，依 Wiki 順序記錄。`Regular Bullet` 用 `regular-bullet` 灰色標記，`Unique Bullet` 用 `unique-bullet` 橘色標記；納入 Unique 變體時，保留它繼承的普通效果及橘色 Unique 效果。神器的冷卻與已核對固定效果放 `facts`；隨物品強度變動的持續時間或數值不納入。Wiki 沒有標記的武器效果不要自行補造，個別掉落物的附魔槽也不納入。欄位格式見[內容契約](specs/content-contract.md)。
3. **保留雙語與完整來源。** `en` 欄逐字保留核對到的 Wiki 原文；`zh-Hant` 欄用圖鑑翻譯，未核實遊戲繁中用語時不要標成官方譯名。每把近戰與遠程武器都必須同時記錄 [Dungeons:Weapon](https://minecraft.wiki/w/Dungeons%3AWeapon) 總表及正確的具體武器項目頁，無論效果由哪一頁核對；所有多筆來源依範圍由大至小排列，總表／分類頁在前、具體物品頁在後。只有單一來源的非武器條目維持原樣。詳情來源標題使用繁中全形冒號 `來源：`、英文半形冒號 `Sources:`。同步更新 [`docs/sources.md`](sources.md)，說明哪些資料取自彙整頁與項目頁。
4. **從來源頁同步原圖。** 先在 `content/catalog.sqlite` 的 `icon_assets` 登記語意 ID、檔名、素材類型、Wiki 頁面及檔名；固有效果標記使用 `built-in-property`。執行 `npm run icons:sync:dry-run` 核對資料庫登記的圖檔仍出現在來源頁，確認後執行 `npm run icons:sync`；同步工具從 SQLite 讀來源和檔名，處理 MediaWiki continuation 分頁、下載 Wiki 目前提供的 PNG，並更新 `docs/wiki-icon-sync.json`。以 Wiki 來源取得的檔案視為最新版，不與舊圖逐位元比對。`src/icon-assets.mjs` 僅負責把已登記 ID 解析為 URL。完整素材規則見[圖標素材規範](specs/icon-assets.md)。
5. **鎖定清單與呈現驗收。** 更新 `tests/routes.test.mjs`，明列本輪收錄項目及應有的固有效果，讓漏列和多列都會失敗。執行 `npm test`、`npm run build`，直接檢查 `dist/index.html`、`dist/src/`、`dist/data/` 與 `dist/assets/`：確認名稱、稀有度、效果標記、描述、來源連結及圖標路徑；若改了版型，核對建置後的 HTML、CSS 與 JavaScript 結構。不要啟動瀏覽器；靜態產物無法證明的互動或實際渲染結果標為未驗證。增加神器時另確認神器分類只有神器，神器條目同時出現在「全部裝備」。

## 發布授權

- 放行 push `main`：user 2026-11-20 選「允許直推 main」，接受推 `main` 即觸發 GitHub Pages 部署（`.github/workflows/pages.yml`）。agent 可直接推 `main`，不必先問。
- 推之前只推綠的：先跑 `npm test` 與 `npm run build`。
- 放行不含 `git push --force`／`--force-with-lease`，這兩個仍要先問 user。
- 已部署的內容不能靠還原這段規則收回。

## 工作慣例

來源：user 2026-11-20 重裝時逐條回答舊 `AGENTS.md` 的去向清單，選「搬進專案」。

- 規格與實作不一致時，查驗收、原始碼與 `DECISIONS.md`，確認是實作偏離還是需求變更。
- 會阻塞主行程、又能和其他工作平行的事（等算繪、等外部 job、跑很久的測試）一律開背景任務，完成通知來了再處理結果。
- `claude-decisions.json` 和 `DECISIONS.jsonl` 由使用它們的整合維護，不手改、不清除。
- 直接在 `main` 上 commit，不開分支、不開 PR。推送授權只看上方〈發布授權〉。

## 外部工具

- Claude with ChatGPT（`agents-with-chatgpt` skill）：
  - 用途：唯讀工作優先交給它，取代子代理：冷審查、規劃、唯讀調查、長篇文字草稿。
  - 它只讀（經 connector），不改檔、不跑指令；改檔與測試由主 session 做。
  - 不付費、不算額度，不設呼叫上限。
  - 不可用（未連線、未登入、連接器失效、逾時重試一次仍失敗）時：立即停止這一輪的工作，回報不可用的原因與停在哪一步。未經 user 同意，不改開子代理、不改用其他會消耗額度的服務、不改由主 session 自查代替。
  - 例行小改、跑測試不交給它。
