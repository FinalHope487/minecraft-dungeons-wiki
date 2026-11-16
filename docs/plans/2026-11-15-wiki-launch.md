# Minecraft Dungeons Wiki 首版計畫

盤點日期 2026-11-15（台灣時間）。作業正常繳交至 11/16 23:59，遲交至 11/17 16:00，依[原對話中的作業說明](https://chatgpt.com/s/cx_6af9bacdf0008191b7121a8561f90b29)。

## 目標與狀態

進行中。按 [專案規格](../spec.md) 完成可公開操作的裝備與附魔 Wiki，並用一次神器擴充驗證新增流程。

- [x] 已初始化 Collab Kit，規格已記錄兩種物品展示版型。
- [x] 已找到首批條目、視覺參考與部署資料的查核入口，見下方來源表。
- [x] 2026-11-16 已建置本機裝備與附魔首版，兩種版型共用資料與網址。
- [ ] 找回兩張參考圖與舊 HTML。神器分類與 Death Cap Mushroom 樣本已完成，詳見[神器擴充計畫](2026-11-16-artifact-category.md)；公開站與繳交證據仍待完成。

## 改動邊界

涉及單頁物品列表與詳情、條目資料、可發布的素材、協作文件與靜態網站部署。首版範圍為一代 Minecraft Dungeons 的裝備與附魔，神器用於擴充驗證。

### 文件缺口

| 時機 | 檔案 | 要補的內容 |
| --- | --- | --- |
| 開工前 | `docs/spec.md` | 補上首版條目範圍、分類導覽、直接連結、不存在的條目或空列表、版型切換保留選取、鍵盤與窄螢幕驗收。橘色六角圖標已寫入現行規格。 |
| 開工前 | `docs/specs/content-contract.md` | 共同識別碼、分類欄位、關聯類型、遊戲版本與查證狀態。兩款版型共用資料；明定裝備等級、隨等級變動的數值和個別掉落附魔不出現在展示，附魔條目本身可記載階級效果。 |
| 開工前 | `docs/project-rules.md` | 條目與素材位置、檔名、分類設定、新增條目與分類的步驟及驗證方式。格式確定後附上一筆能直接仿作的條目。 |
| 開工前 | `DESIGN.md` | 對照兩張原圖，記錄畫面與量測依據、方格比例與間距、外框、圖標、文字層級、桌面及窄螢幕行為。把參考圖與可發布素材分開列明。 |
| 首版可執行時 | `README.md` | 專案簡介、公開站連結、環境與實際跑過的開發／建置／驗證指令、貢獻入口及非官方聲明。 |
| 首版可執行時 | `docs/project-rules.md` 的驗證章節 | 指令、資料完整性檢查、桌面及手機操作、公開站驗收。步驟增多時再獨立成 `docs/testing.md`。 |
| 發布前 | `docs/sources.md` | 記遊戲版本、欄位查證狀態與資料來源。公開素材清單按素材識別碼記相對路徑、出處、權利與署名、查核日期及發布狀態。參考圖的用途另記。 |
| 發布時 | `README.md` 的部署段落 | 發布來源、專案子路徑、如何重跑部署及實際公開網址。頁面上有可見的非官方說明與素材署名。 |
| 擴充後 | `SUBMISSION.md` | 專案簡介、GitHub repo、公開網頁、`CLAUDE.md`、新增神器的指令與改動、公開站測試結果、兩款版型截圖、發布版本與獨立 commit 連結。 |

`CLAUDE.md` 已具備作業要求的規則檔。待前端入口確定後，核對它能引導新 AI 找到規格、內容規則和驗證。`QUESTIONS.md` 留給需要拍板的事項，`ROADMAP.md` 追蹤待辦與實跑基線，`handoff.md` 記錄目前接手點；架構決策可在拍板後放 `docs/decisions/`。

GPT 建議以 Vite + TypeScript、靜態資料及 GitHub Pages 作為候選方案。2026-11-16 實測 npm registry 無法存取，本機首版採用免安裝套件的靜態 JavaScript 模組及 Node 建置。網址使用 hash，背包格是預設版型。怪物子規格與資料、搜尋／篩選專屬規格、新 SOP 等有具體需求時再建。

### 條目與素材查核

| 順序 | 項目與來源 | 要取得或確認 |
| --- | --- | --- |
| 首版 | [Sword](https://minecraft.wiki/w/Dungeons%3ASword)、[Diamond Sword](https://minecraft.wiki/w/Dungeons%3ADiamond_Sword) | 一代圖標、稀有度、英文遊戲原文、固定特性。Diamond Sword 的 `Extra damage` 顯示橘色六角圖標；遊戲自帶固定特性和個別掉落物的附魔槽各自處理。 |
| 首版 | [Sharpness](https://minecraft.wiki/w/Dungeons%3ASharpness)、[Swirling](https://minecraft.wiki/w/Dungeons%3ASwirling)、[附魔總表](https://minecraft.wiki/w/Dungeons%3AEnchantment) | 類型、觸發條件、階級效果及版本。Sharpness 與 Swirling 為建議樣本；以已核對證據建立至少一條裝備到附魔的連結，Swirling 隨物品強度變動的傷害以機制描述呈現。 |
| 擴充 | [官方神器介紹](https://www.minecraft.net/en-us/article/minecraft-dungeons--9-essential-artifacts)、[Death Cap Mushroom](https://minecraft.wiki/w/Dungeons%3ADeath_Cap_Mushroom)、[神器總表](https://minecraft.wiki/w/Dungeons%3AArtifact)、[Creeper Woods 掉落表](https://minecraft.wiki/w/Dungeons%3ACreeper_Woods) | 已用 Death Cap Mushroom 完成一筆神器樣本，核對使用效果、冷卻、強度變動持續時間及可發布圖標；本次展示不含取得條件，詳見[神器擴充計畫](2026-11-16-artifact-category.md)。 |
| 後續 | [Minecraft Dungeons 一代索引](https://minecraft.wiki/w/Minecraft_Dungeons)、[附魔怪物](https://minecraft.wiki/w/Dungeons%3AEnchanted_Mobs) | 怪物欄位先規劃行為、出現區域、變體與來源；首版完成後才選示範條目。 |
| 視覺 | [官方 Dungeons 遊戲頁](https://www.minecraft.net/en-us/about-dungeons)、[官方玩法預告解析](https://www.minecraft.net/en-us/article/minecraft-dungeons-news)、[對話中的六角圖標參考](https://staticg.sportskeeda.com/editor/2021/10/74727-16341531279928-1920.jpg) | 兩張使用者指定的原圖先放進 `references/images/`，另擷取一代英文 Sword／Diamond Sword 詳情及附魔欄；記下遊戲版本和截圖位置。六角圖標參考用於辨識外觀，公開素材另查權利。 |
| 發布 | [Minecraft 使用指南](https://www.minecraft.net/en-us/usage-guidelines)、[GitHub Pages 官方建立步驟](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) | 逐一記錄圖標、字型、背景和截圖來源及使用條件。可公開的產物須能在 GitHub Pages 專案子路徑下載資源並直達條目。 |

社群條目用於定位與交叉檢查；遊戲原文、圖示和實際畫面以可辨識版本的遊戲截圖為查核依據。公開資料使用 Minecraft Dungeons 一代，並分開記錄資料來源與圖像權利。缺證據的欄位標為待查證，先略過不確定的數值或關聯。

## 步驟與驗證

1. **收齊素材並確認首版方案。** 找回兩張原圖與原型，或以原圖重建可比較的兩種版型。定稿前端工具、正式站預設版型、條目格式和網址策略。先用 Sword 寫出正式欄位、分類、關聯及來源狀態的範例，再接 UI。
2. **做兩把劍的原型。** 兩款版型共用資料、選取狀態與詳情呈現，先讓圖標、選取框、詳情和窄版排版一起運作。實測四種版型與物品組合，只有 Diamond Sword 顯示 `Extra damage` 與橘色六角圖標。
3. **補首版資料與檢查。** 加入兩筆附魔及至少一條有來源的裝備到附魔連結。檢查必填欄位、重複識別碼、無效關聯、遺失圖檔、直接開網址／重新整理／返回鍵、鍵盤與窄螢幕。完成可仿作條目及實跑指令。
4. **發布與公開實測。** 建立 GitHub repo 與 Pages，在未登入的工作階段開啟首頁和條目直連，點完裝備到附魔流程，確認素材載入與手機操作。記錄版本、部署網址與實測結果。
5. **用神器證明可擴充。** 在新 AI 對話只提供 repo、已查證的神器資料及新增指令，依現有文件新增分類與首筆條目。以獨立 commit 記錄，驗證公開站從首頁可進神器並能打開詳情，將指令、改動與公開結果放進繳交稿。

## 切換與回退

把首版和神器擴充分成獨立 commit。擴充驗收失敗時可回退擴充 commit、重新部署首版並驗證首頁與既有條目連結。

## 執行結果

[GPT 唯讀審查](https://chatgpt.com/g/g-p-6af9becede248191b16f106daeef895e/c/6af9bef8-9a2c-83ee-93a8-b82ea6b552c0) 已直接讀取規格、協作規則、計畫與目錄。2026-11-16 已通過本機建置與瀏覽器預覽，證據見 [ROADMAP.md](../../ROADMAP.md)。目前圖示為自製素材，精確的遊戲畫面比對尚未進行。GitHub CLI 未登入，repo 沒有 remote，公開部署尚未執行。
