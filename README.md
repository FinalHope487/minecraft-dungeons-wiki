# 地城圖鑑 · Minecraft Dungeons

Minecraft Dungeons 一代的非官方物品圖鑑，收錄裝備、附魔、消耗品與其他物品。可以從物品格切換詳情，也可用網址分享目前的條目與版型。

收錄依據：[Minecraft Wiki 物品總覽](https://minecraft.wiki/w/Dungeons%3AItem) 與[附魔總表](https://minecraft.wiki/w/Dungeons%3AEnchantment)；分類及個別條目的完整來源見[素材與資料來源](docs/sources.md)。

## 本機執行

需要 Node.js 22.13 以上。專案無 npm 相依套件；建置使用 Node 內建 SQLite API。

```sh
npm run dev
npm test
npm run build
npm run preview
```

開發與建置預覽預設使用 `http://127.0.0.1:4173/`，一次啟動其中一個即可。要改埠可設定環境變數 `WIKI_PORT`。建置輸出是 `dist/`。

## 新增內容

編輯 `content/catalog.sqlite`（可用 [DB Browser for SQLite](https://sqlitebrowser.org/)），先讀 [SQLite 資料庫規範](docs/specs/catalog-storage.md) 與 [內容契約](docs/specs/content-contract.md)。新增資料後用 `npm run dev` 預覽或 `npm run build` 檢查；JSON 是建置產物，不要手動編輯。網站只在選取條目時讀取該條目的 JSON，離屏圖片由瀏覽器延遲載入。圖示、英文遊戲原文和來源狀態見 [素材與資料來源](docs/sources.md)。

## 教學簡報與 LLM Wiki

- [教學簡報](https://finalhope487.github.io/minecraft-dungeons-wiki/slides/)（原始檔 `slides/index.html`，建置時一併輸出）
- [LLM Wiki](llm-wiki/README.md)：8 份來源整理（`raw/`）、7 頁概念頁（`wiki/`）、[索引](llm-wiki/wiki/index.md)與[執行紀錄](llm-wiki/wiki/log.md)
- [流程圖、檢查點與反思](docs/llm-wiki-workflow.md)
- `node tools/check-llm-wiki.mjs` 跑 C-01～C-06 檢查（`npm test` 已包含）

## 發布

線上圖鑑：[https://finalhope487.github.io/minecraft-dungeons-wiki/](https://finalhope487.github.io/minecraft-dungeons-wiki/)。GitHub repo 的 Settings → Pages → Build and deployment → Source 選 GitHub Actions，執行 [Wiki Pages workflow](.github/workflows/pages.yml)。產物使用相對路徑；條目由網址雜湊定位，專案子路徑下可直接開啟及重新整理。網址以成功部署的 workflow 輸出為準。

## 聲明

這是非官方粉絲專案，與 Mojang 或 Microsoft 無關。遊戲素材及參考圖出處列在 [素材與資料來源](docs/sources.md)。
