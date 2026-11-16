# Minecraft Dungeons 附魔與裝備全量收錄

## 目標

依 Minecraft Wiki 一代《Dungeons:Enchantment》與《Dungeons:Item》補齊全部附魔、近戰武器、遠程武器和盔甲。保留具名 Unique、Seasonal、Exclusive、Mob-only 與未使用項目；每筆資料標示 Wiki 稀有度、適用類別、實裝狀態及 Seasonal 狀態。

Wiki 總覽文字統計 224 件可取得裝備；具名清單另列 4 件未使用裝備。完整清單為 83 件近戰、72 件遠程、73 件盔甲，共 228 件，含 21 件 Seasonal 和 4 件未實裝項目。附魔依名稱去重；同一附魔適用多種裝備時只建一筆，並完整列出適用類別。

規格：[圖鑑公開規格](../spec.md)、[條目資料契約](../specs/content-contract.md)、[SQLite 資料庫規範](../specs/catalog-storage.md)、[圖標素材規範](../specs/icon-assets.md)。彙整來源與具體條目頁見[素材與資料來源](../sources.md)。

## 執行順序

### 1. 附魔

- 依 `Dungeons:Enchantment` 收錄英雄可用的 Common、Powerful 附魔，以及 Exclusive、Mob-exclusive、Unused 區段中列出的其他附魔。
- 對跨裝備類別的同名附魔建立單筆條目；`facts` 列出近戰、遠程、盔甲、怪物或其他適用範圍，`badge` 保留來源所列稀有度／分類。
- 依具體 Wiki 條目頁核對名稱、原文說明、適用範圍和圖標。來源沒有獨立圖標時重用 Wiki `?` placeholder。
- 已在遊戲中生效的怪物專用附魔標為已實裝；Wiki 列於未使用且未在遊戲中生效的項目標為未實裝。只在 Seasonal Trials 出現的 Invisible 標記 Seasonal；其他附魔不因一般季節活動而標記。
- 更新附魔清單 fixture、來源登錄、圖標登錄、同步 manifest 和驗收測試。提交並推送此階段後才進入裝備階段。
- 已以 `npm test`（17/17）、`npm run build`（7 個分類、248 筆）和本地 `dist/` 靜態檢查驗收；124 個附魔的雙語說明、來源與 PNG 圖標皆完整。230 個 Wiki 圖標同步成功；提交 `593b860` 已推送至 `origin/main`。

### 2. 近戰、遠程武器與盔甲

- 依 `Dungeons:Item` 具名表逐項收錄 83 件近戰、72 件遠程及 73 件盔甲，包含 224 件可取得裝備和 4 件未使用項目、21 件 Seasonal。
- 各基礎類型與其變體相鄰排列；沿用既有 ID，不把同一個可掉落裝備拆成 Common、Rare 兩筆。
- 依每個具體項目頁核對中英文名稱、`In-game description`、稀有度、固定特性和圖標；普通特性使用 Regular Bullet，Unique 特性使用 Unique Bullet。
- 對 Unique 裝備建立到基礎裝備與已收錄固有附魔的關聯；基礎裝備列出其具名變體。附魔頁的 `Built-into` 關係也連回對應裝備，並以來源頁核對每個目標。
- Seasonal 只依 Wiki 明確標示設定；未使用項目的 `implemented` 設為 `false`，並在詳情與物品格顯示未實裝標籤。
- 更新裝備清單 fixture、來源登錄、圖標登錄、同步 manifest 和驗收測試。
- 已以 `npm test`（18/18）、`npm run build`（7 個分類、446 筆）及本地 `dist/` 靜態檢查驗收：228 件裝備的條目 JSON 與圖標完整、21 件 Seasonal、4 件未實裝；SQLite 完整性通過、外鍵錯誤 0。426 個 Wiki 圖標同步成功；未開瀏覽器，實際渲染未驗證。功能提交 `54fe6f6` 已建立，待推送。

## 驗收

- 附魔 fixture 與 Wiki 各區段去重後的具名清單完全一致，無重複 ID；分類、稀有度、適用類別、實裝狀態及 Seasonal 狀態有來源依據。
- 裝備 fixture 分別精確列出 83 件近戰、72 件遠程和 73 件盔甲；其中 4 件未使用項目標為 `implemented: false`，21 件 Seasonal 標記符合 Wiki 清單。
- 每項新增裝備的英文描述逐字符合具體頁面的 `In-game description`；每項來源可追溯至彙整頁和具體條目頁。Wiki 沒有單品圖標時才使用 `?` placeholder。
- `npm test` 與 `npm run build` 通過；直接檢查 `dist/index.html`、`dist/src/`、`dist/data/` 和 `dist/assets/`，不啟動瀏覽器。驗證分類數、條目數、雙語內容、標籤、來源、圖標路徑和檔案存在。
- 驗收範圍以專案指定的 Wiki 頁面和其記錄的修訂為準；不以其他《Minecraft Dungeons》續作頁面補資料。

## 回退

附魔與裝備分階段提交。撤回單一階段時回退該階段 commit，刪除該階段匯出的條目 JSON 與不再使用的圖標登錄／檔案，保留已發布 ID 的記錄，不重用 ID。
