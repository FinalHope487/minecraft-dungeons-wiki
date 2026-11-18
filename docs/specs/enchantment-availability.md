# 附魔玩家與怪物效用

## 固定資料欄位

124 筆附魔各有一筆 `enchantment_effect_profiles`：

| 欄位 | 值 | 用途 |
| --- | --- | --- |
| `player_availability`、`mob_availability` | `available`、`unavailable`、`unknown` | 分開保存玩家與怪物可用性。 |
| `effect_relation` | `same`、`different`、`unknown` | 記錄兩側效果是否相同。未知時不猜測。 |
| `player_fact_id`、`mob_fact_id` | fact ID 或 `NULL` | 連到對應雙語效果與來源證據。 |

效果文字保留在有穩定 `semantic_key` 的 `facts`。每筆 fact 記錄 `claim_origin`（`source`、`inference`、`unknown`）、Wiki 標記 `wiki_status`（`unmarked`、`verify`、`unknown`）及來源證據關係。`Audience`、`Evidence confidence` 等整理欄位仍保留為 facts；不把可信度與 Wiki 自己的待查標記混成同一狀態。

## 顯示政策

- 玩家與怪物效果相同且兩側可用：顯示玩家效果，另註怪物同樣使用，不重複全文。
- 效果不同且兩側可用：以同一層級分別顯示玩家與怪物效果。
- 效果關係為 `unknown` 且雙側各有來源支持的效果：主欄同層顯示玩家與怪物效果；「更多資訊」標示效果關係未確認，不把未知當成相同或不同。
- 一側明確不可用：只顯示另一側，不輸出不可用一側的效果。另一側可用性未知且效果有來源支持時，仍顯示該效果並標示未確認。
- 可用性為 `unknown`：有來源支持的效果仍顯示於主欄，並在效果旁標示可用性未確認；沒有來源的推論效果不冒充實際效果。
- Wiki 有 `[verify]` 標記時，在對應效果及其 Wiki 原文旁保留註記。
- `claim_origin='inference'` 或 `unknown` 的 facts 收在預設收合的「更多資訊」；`source` facts 必須至少有一筆 `supports` 證據，才能作主欄內容。`context` 只表示來源相關，不作支持證據。
- 完整順序為主效果與事實、相關條目、更多資訊、來源。可信度不作為隱藏已知來源效果的條件。

## 資料查核

- 對照[附魔總表](https://minecraft.wiki/w/Dungeons%3AEnchantment)、[附魔怪物](https://minecraft.wiki/w/Dungeons%3AEnchanted)、[每日試煉](https://minecraft.wiki/w/Dungeons%3ADaily_Trial)及各附魔條目頁。
- Wiki 沒寫效果或來源互相衝突時，保留原始說法和來源，效果關係或可用性填 `unknown`；不可從清單缺項推成確定不可用。
- `fact_evidence` 的 `context` 代表來源與該項目相關，不宣稱該頁明確支持這個 fact。只為逐筆核實的 fact 標 `supports` 或 `conflicts`；禁止由條目名稱或 semantic key 推定。Ambush 的 `mob_effect` 由 Enchanted Mobs 支持，不由 Ambush 單品頁支持。未完成逐筆查核的 facts 保留 `claim_origin='unknown'`，相關來源標為 `context`。
- Wiki 記載不等於遊戲內實測；沒有實測時不得描述為遊戲驗證結果。

## 驗收條件

- 124 筆附魔各有一筆效果 profile；玩家／怪物效果 fact ID 必須指向同一條目的相應語意欄位。
- Critical Hit 分開呈現玩家 I／II／III 階的 10%／15%／20% 機率與怪物每次攻擊都造成三倍傷害。
- Wiki 明確標為 `[verify]` 的內容保留待查標記。
- 同效只重複標示怪物同樣適用；不同效果同層顯示；未知不推成不可用或同效。
- `npm test` 與本地建置驗收確認 HTTP 和 `file://` 使用同一份衍生呈現資料。
