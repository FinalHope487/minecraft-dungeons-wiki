# 圖鑑畫面

兩款版型以 `references/images/` 的「橫向選單參考」與「選單加資訊」為底。原版裝備及附魔圖標在方格與詳情共用，原版背景及格框由畫面截取。

## 背包格與右側詳情

桌面左右欄比例約 2:3。背包每列三格，至少四列，每格上限 102 px。普通格保留截圖裁切的金屬斜面，Unique 使用橘色內框與左上光暈。白色階梯角框標示選取，鍵盤焦點用額外虛線。未使用的格子沿用使用者提供的原版暗色 X 空格素材，超出四列時補齊末列。空格不計數、不接受焦點。

## 橫向小方格與下方詳情

列表用掉落物畫面中的 60 px 深色細框和 1 px 間隙，依可用寬度橫排，空間不足才換行。滑鼠移入或鍵盤聚焦顯示名稱，白色階梯角框保留選取。詳情置於列表下方。

## 共用詳情

名稱與稀有度在左，放大的物品圖在右。下方提供固定資訊、物品說明、關聯與來源。Diamond Sword 的橘色 `Unique Bullet` 六角標記在「額外傷害」左側。繁中版的裝備說明可展開英文原文。語言與版型切換保持選取，分享網址保留語言、分類、版型與選取。圖標來源和引用方式依[圖標素材規範](docs/specs/icon-assets.md)。

英文站名與物品名稱採 Minecraft Ten v2，英文稀有度及內文用 Noto Sans，繁中採 Noto Sans TC。

分類列、物品欄、每個物品方格與詳情共用原版背包參考圖的同一張底圖，從暗紅過渡到近黑。方格以半透明暗色增加圖標對比。橫向小方格列表疊一層半透明暗色遮罩，詳情使用較淡的遮罩。

## 頂部橫幅

獨立的深色純底以金屬細邊與內容區區隔。鑽石劍沿用原版圖標，置入從遊戲物品欄裁出的斜面框，兩側分別是站名與兩組切換控制。版型與語言共用深色分組和淺色選取底線，呼應背包分類的選取狀態。720 px 以下控制項換到標題下方，仍可直接操作。按鈕與語言連結至少 44 × 44 px，鍵盤焦點用內縮虛線標示。橫幅配色與選取參照 [Mojang 原版背包畫面](https://www.minecraft.net/en-us/article/minecraft-dungeons-news)，控制項驗收參照 [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines)。

[桌面橫幅](references/review/masthead-desktop.png) · [英文窄版橫幅](references/review/masthead-mobile.png)

GPT 比對新舊實際截圖及原版畫面，確認站名與兩組選取狀態清楚，背包的四件物品與八個 X 空格完整。瀏覽器另在 320、340、390、720、721 px 驗證無橫向溢出，並實測鍵盤切換及手機抽屜關閉後還原焦點。[GPT 審查對話](https://chatgpt.com/g/g-p-6af9becede248191b16f106daeef895e/c/6af9bef8-9a2c-83ee-93a8-b82ea6b552c0)

## 預設展示

| 裝置 | 介面 | 截圖 |
| --- | --- | --- |
| 桌面 B | 緊湊間距、較淡分隔線及實色稀有度標籤。背包詳情在右側，橫向格詳情在下方。 | [繁中背包](references/review/bc-inventory.png) |
| 手機 C | 720 px 以下，點分類標題旁的「查看詳情」開啟抽屜。Esc 或關閉按鈕關閉後還原焦點。開場動效遵守減少動態效果偏好。 | [手機抽屜](references/review/bc-mobile.png) |

[英文橫向版](references/review/bc-compact.png)顯示同一筆資料的英文介面。設計記錄採 [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) 的元素及狀態記錄方式。抽屜用短距離位移與透明度提供開場回饋，鍵盤和焦點依 [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines) 驗收。

[來源與素材](docs/sources.md) 記錄背景、格框與圖標來源。網站版型控制、分類導覽和中文標題沿用網頁排版。

## 2026-11-16 GPT 視覺審查

GPT 讀取兩張原版參考及三張 Chromium 截圖。確認兩款版型、四件裝備總覽、獨立附魔與橘色六角圖標。原版的像素字型、物品排列密度、框線色階、背景明暗及圖標比例仍有差異。截圖中的版型按鈕高亮另於瀏覽器複測，橫向模式僅橫向按鈕為按下狀態，背包格背景透明。

[背包格截圖](references/review/inventory.png) · [橫向格截圖](references/review/compact.png) · [附魔截圖](references/review/enchantments.png) · [GPT 審查對話](https://chatgpt.com/g/g-p-6af9becede248191b16f106daeef895e/c/6af9bef8-9a2c-83ee-93a8-b82ea6b552c0)

同日共用底圖複審確認分類、列表與詳情的紋理連續。後續方格透底複審已開啟兩款最新截圖，格內無明顯接縫，四件裝備圖標、稀有框與白色選取框均清楚可辨。

[背包格透底](references/review/shared-slots-inventory.png) · [橫向格透底](references/review/shared-slots-compact.png)

三欄複審確認兩款皆為 3＋1 排列，原版格框、選取狀態與詳情清楚。橫向列表多出第二列，詳情隨列表下移。

[背包格三欄](references/review/three-columns-inventory.png) · [橫向小方格三欄](references/review/three-columns-compact.png)

後續複審確認固定三欄只套用在背包格。橫向小方格於 770 px 視窗四件同列，340 px 視窗第四件自然換行且無橫向溢出。GPT 比較兩張桌面截圖，確認格框與詳情樣式維持一致。

[橫向小方格自動排列](references/review/adaptive-compact.png)

英文物品標題與橫幅英文小標使用 Minecraft Ten v2，保留原版畫面中的方塊輪廓。英文說明、稀有度與其他英文內文使用 Noto Sans。繁中各級標題與介面採 Noto Sans TC，標題透過字重建立層級。字型由網站本機提供，見[素材來源](docs/sources.md)。

GPT 比對兩款新版截圖與原版背包畫面，確認標題更接近原版、內文與分類清楚，仍有字形比例和字距差異。瀏覽器另在 340 px 驗證兩款的 Hunter's Armor 標題未溢出或蓋到圖標。

[背包字型預覽](references/review/minecraft-type-inventory.png) · [橫向字型預覽](references/review/minecraft-type-compact.png)

字型複審比較原版與兩款更新前後的截圖，確認英文標題更接近原版像素風格，物品欄、詳情及選取狀態維持正常。瀏覽器已確認本機字型可載入。字母造型及字距仍與原版不同。

[背包格字型](references/review/pixel-font-inventory.png) · [橫向小方格字型](references/review/pixel-font-compact.png)

雙語與方格複審比對四張本機截圖及兩張原版參考。重裁格框並重拍手機預覽後，GPT 確認空格沒有角標、白色選取框清楚、抽屜關閉按鈕和大圖完整。瀏覽器另驗證 340 px 三欄與抽屜焦點復原、300 px 橫向自然換行，以及語言切換保留條目和版型。[GPT 審查對話](https://chatgpt.com/g/g-p-6af9becede248191b16f106daeef895e/c/6af9bef8-9a2c-83ee-93a8-b82ea6b552c0)

B+C 成為預設後，GPT 比對新增的原版 X 空格參考與三張實際截圖，確認三欄四列、桌面詳情和手機抽屜呈現正常。不同背景下，桌面空格看起來比原圖略暗。瀏覽器另實測 Esc 焦點還原及在抽屜開啟時切回桌面尺寸。

背包格預設每列 3 格，可在分類標題旁調整為 2–6 格。設定寫入 `columns` 網址參數；預設值不產生參數，橫向小方格不顯示此控制。
