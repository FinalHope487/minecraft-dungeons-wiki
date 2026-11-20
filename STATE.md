# 現況

最後更新：2026-11-20。只寫現在生效的事。理由與沿革在 git 與 `DECISIONS.md`。上限 6 KiB。

## 目標

- 產品：可在公開網頁瀏覽的 Minecraft Dungeons 圖鑑，內容依 Minecraft Wiki 收錄物品與附魔，嚴格使用原版介面與可追溯的遊戲素材。
- 現階段：建立可公開驗收的 Wiki 首版（`ROADMAP.md` 的 `[now]` 項）。
- 只有 user 能驗收。

## 生效中的契約

| 契約 | 內容 |
|---|---|
| 資料來源 | `content/catalog.sqlite`（SQLite v6），欄位與編輯方式見 `docs/specs/content-contract.md` |
| 驗收 | 每輪跑 `npm test` 與 `npm run build`，直接檢查 `dist/`；不啟動瀏覽器或預覽伺服器，靜態產物證明不了的標「未驗證」 |
| 圖標 | 只用可追溯到遊戲原始素材的原版圖標，不自創（`docs/specs/icon-assets.md`） |
| 語言 | 繁中預設，英文用 `?lang=en` |
| 發布 | push `main` 會觸發 GitHub Pages 部署（`.github/workflows/pages.yml`）；user 已放行直推 `main`，條件見 `docs/project-rules.md`〈發布授權〉 |

公開契約與驗收條件在 `docs/spec.md`。

## 下一步

- 依 `docs/plans/2026-11-15-wiki-launch.md` 核對公開素材使用條件；GitHub CLI 登入與 remote 就緒後發布並實測。
- Multishot 的玩家與怪物效果關係待固定版次確認；38 筆 facts 與來源摘錄不同，見 `docs/plans/2026-11-18-enchantment-effect-rewrite.md`。

## 停損訊號

| 訊號 | 動作 |
|---|---|
| 這一輪讓原本好的東西變差 | 回退這一輪，不往上疊 |
| 同類問題連續出現、修一處壞一處 | 停手，重新審視那個契約 |
| 發生資料遺失、誤推送或誤對外發送 | 停手，不自行修補；回報當下狀態與可回退的手段，由 user 決定 |

## 檔案地圖

「人」＝user 會讀也可能改，用 user 的語言、自然語言寫。「agent」＝只有 agent 讀，用結構化寫法。

| 檔案 | 讀者 | 何時讀 |
|---|---|---|
| `AGENTS.md`、`STATE.md` | 人、agent | 每次開工先讀（有 `CLAUDE.md` 匯入的平台自動載入） |
| `DECISIONS.md` | 人、agent | 對某個決定有疑問時 |
| `ROADMAP.md`、`ROADMAP/` | 人、agent | 選工作時 |
| `QUESTIONS.md` | 人、agent | 有待決問題時 |
| `docs/spec.md`、`docs/plans/` | 人、agent | 動到公開契約或接手跨輪計畫時 |
| `docs/procedures/` | agent | `AGENTS.md`〈程序〉的觸發條件成立時 |
| `docs/project-rules.md`、`docs/testing.md`、`docs/cold-review.md` | agent | 要跑驗證、審查或委派時 |

## 測試

`npm test`；建置 `npm run build`。測試數字寫在 commit message。
