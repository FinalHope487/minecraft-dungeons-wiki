export const languages = ['zh-Hant', 'en'];

export const uiText = {
  'zh-Hant': {
    title: '地城圖鑑', skip: '跳至圖鑑', layout: '展示版型', inventory: '背包格',
    columnsLabel: '每列格數', columnOption: (count) => `${count} 格`,
    compact: '橫向小方格', inventoryHint: '與右側詳情', compactHint: '與下方詳情', drawerHint: '與底部抽屜詳情',
    categories: '圖鑑分類', language: '語言', details: '條目詳情', all: '全部裝備',
    empty: '此分類尚無條目', missing: '找不到條目', home: '回到全部裝備',
    mobileActions: '目前選取物品與詳情操作', selectedLabel: '目前選取', chooseItem: '請先選擇物品',
    related: '相關條目', original: '英文原文', sources: '來源：', open: '查看詳情', close: '關閉詳情',
    loading: '載入中…', loadError: '無法載入圖鑑資料', detailError: '無法載入條目詳情', retry: '重試',
    footer: '非官方粉絲圖鑑，與 Mojang 或 Microsoft 無關。',
    meta: 'Minecraft Dungeons 一代物品圖鑑，收錄裝備、附魔、消耗品與其他物品。',
    count: (n) => `${n} 筆`, selected: (name) => `目前條目：${name}`,
  },
  en: {
    title: 'Dungeon Codex', skip: 'Skip to the codex', layout: 'Layout', inventory: 'Inventory',
    columnsLabel: 'Columns per row', columnOption: (count) => `${count} columns`,
    compact: 'Compact', inventoryHint: ' with side details', compactHint: ' with details below', drawerHint: ' with details in a bottom sheet',
    categories: 'Codex categories', language: 'Language', details: 'Item details', all: 'All gear',
    empty: 'No entries in this category', missing: 'Entry not found', home: 'Back to all gear',
    mobileActions: 'Selected item and detail actions', selectedLabel: 'Selected item', chooseItem: 'Select an item first',
    related: 'Related entries', original: 'Original English', sources: 'Sources:', open: 'View details', close: 'Close details',
    loading: 'Loading…', loadError: 'Could not load the codex data', detailError: 'Could not load this entry', retry: 'Retry',
    footer: 'Unofficial fan codex. Independent of Mojang and Microsoft.',
    meta: 'Gear, enchantments, consumables, and other items from the original Minecraft Dungeons.',
    count: (n) => `${n} ${n === 1 ? 'entry' : 'entries'}`, selected: (name) => `Selected item: ${name}`,
  },
};

export function resolveLanguage(search) {
  return new URLSearchParams(search).get('lang') === 'en' ? 'en' : 'zh-Hant';
}
