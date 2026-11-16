import { allCategory, defaultLayout, entryHash, listEntries, resolveRoute } from './routes.mjs';
import {
  defaultInventoryColumnCount,
  getInventoryEmptySlotCount,
  inventoryColumnCounts,
  resolveInventoryColumnCount,
} from './inventory-grid.mjs';
import { resolveLanguage, uiText } from './locale.mjs';
import { iconAssetUrl } from './icon-assets.mjs';

const params = new URLSearchParams(location.search);
const lang = resolveLanguage(location.search);
const ui = uiText[lang];
document.documentElement.dataset.layout = defaultLayout;
const message = (text) => text[lang];
document.documentElement.lang = lang;
document.title = `${ui.title} · Minecraft Dungeons`;
document.querySelector('meta[name="description"]').content = ui.meta;
for (const element of document.querySelectorAll('[data-text]')) {
  element.textContent = ui[element.dataset.text];
}
for (const element of document.querySelectorAll('[data-aria-label]')) {
  element.setAttribute('aria-label', ui[element.dataset.ariaLabel]);
}
const languageNav = document.querySelector('.languages');
languageNav.setAttribute('aria-label', ui.language);
function updateLanguageLinks() {
  for (const anchor of languageNav.querySelectorAll('a')) {
    const url = new URL(location.href);
    url.searchParams.set('lang', anchor.hreflang);
    anchor.href = url;
    if (anchor.hreflang === lang) anchor.setAttribute('aria-current', 'true');
  }
}

const elements = Object.fromEntries(
  ['categories', 'workspace', 'collection-title', 'count', 'slots', 'details', 'announcement']
    .map((id) => [id, document.getElementById(id)]),
);
const layoutButtons = [...document.querySelectorAll('.layouts button')];
const inventoryColumnsControl = document.getElementById('inventory-columns-control');
const inventoryColumnsSelect = document.getElementById('inventory-columns');
let inventoryColumnCount = resolveInventoryColumnCount(params.get('columns'));
const dialog = document.getElementById('detail-dialog');
const openDetails = document.getElementById('open-details');
const mobileActions = document.getElementById('mobile-actions');
const mobileItemIcon = document.getElementById('mobile-item-icon');
const mobileItemName = document.getElementById('mobile-item-name');
const collectionControls = document.querySelector('.collection-controls');
const mobile = matchMedia('(max-width: 720px)');
const dataDirectory = new URL('../data/', import.meta.url);
const detailCache = new Map();
let categories = [];
let entries = [];
let catalogReady = false;
let detailRequestToken = 0;
for (const count of inventoryColumnCounts) {
  const option = node('option', '', ui.columnOption(count));
  option.value = String(count);
  inventoryColumnsSelect.append(option);
}
inventoryColumnsSelect.value = String(inventoryColumnCount);
elements.categories.setAttribute('aria-label', ui.categories);
elements.details.setAttribute('aria-label', ui.details);

function syncMobileActionPlacement() {
  const useMobileActions = mobile.matches
    && elements.workspace.dataset.layout === 'inventory';
  mobileActions.hidden = !useMobileActions;
  (useMobileActions ? mobileActions : collectionControls).append(openDetails);
}

function syncDetailsPlacement() {
  const focused = document.activeElement;
  const wasOpen = dialog.open;
  if (wasOpen) dialog.close();
  openDetails.hidden = !mobile.matches;
  syncMobileActionPlacement();
  (mobile.matches ? dialog : elements.workspace).append(elements.details);
  for (const button of layoutButtons) {
    const hint = button.querySelector('.sr-only');
    hint.textContent = mobile.matches ? ui.drawerHint : ui[hint.dataset.text];
  }
  if (mobile.matches && elements.details.contains(focused)) {
    openDetails.focus({ preventScroll: true });
  } else if (!mobile.matches && (wasOpen || focused === openDetails)) {
    (elements.slots.querySelector('[aria-current]') ?? document.getElementById('catalog')).focus({ preventScroll: true });
  }
}

openDetails.addEventListener('click', () => dialog.showModal());
mobile.addEventListener('change', syncDetailsPlacement);

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function icon(id, className = 'icon') {
  const image = node('img', className);
  image.alt = '';
  image.loading = className === 'item-art' ? 'eager' : 'lazy';
  image.decoding = 'async';
  if (className === 'item-art') image.fetchPriority = 'high';
  image.src = iconAssetUrl(id).href;
  return image;
}

function link(href, label, className) {
  const anchor = node('a', className, label);
  anchor.href = href;
  return anchor;
}

function renderDetailsContent(entry, layout) {
  const heading = node('header', 'detail-heading');
  const identity = node('div', 'identity');
  const badge = node('span', 'rarity', message(entry.badge));
  const name = node('h2', 'item-name', message(entry.name));
  identity.append(badge, name);
  heading.append(identity, icon(entry.icon, 'item-art'));

  const info = node('div', 'info');
  const facts = node('dl', 'facts');
  for (const fact of entry.facts) {
    const pair = node('div', 'fact');
    pair.append(node('dt', '', message(fact.label)), node('dd', '', message(fact.value)));
    facts.append(pair);
  }
  if (facts.children.length) info.append(facts);
  for (const trait of entry.traits) {
    const line = node('p', 'trait');
    line.dataset.traitIcon = trait.icon;
    const label = node('span', '', message(trait.label));
    line.append(icon(trait.icon), label);
    info.append(line);
  }
  info.append(node('p', 'description', message(entry.description)));
  if (lang === 'zh-Hant' && entry.category !== 'enchantments') {
    const original = node('details', 'original');
    const quote = node('p', 'description', entry.description.en);
    quote.lang = 'en';
    original.append(node('summary', '', ui.original), quote);
    info.append(original);
  }

  const related = node('div', 'related');
  if (entry.links.length) {
    related.append(node('h3', '', ui.related));
    const list = node('ul', 'related-list');
    for (const relation of entry.links) {
      const target = entries.find((item) => item.id === relation.id);
      if (!target) throw new Error(`條目 ${entry.id} 的關聯目標不存在：${relation.id}`);
      const item = node('li');
      const anchor = link(entryHash(target, layout), '', 'related-link');
      anchor.dataset.focusTarget = `entry-${target.id}`;
      const label = node('span');
      const targetName = node('strong', '', message(target.name));
      label.append(targetName, node('small', '', message(relation.label)));
      anchor.append(icon(target.icon), label);
      item.append(anchor);
      list.append(item);
    }
    related.append(list);
  }
  const sources = node('div', 'sources');
  sources.append(node('span', 'source-caption', ui.sources));
  for (const source of entry.sources) {
    const anchor = link(source.url, source.label, 'source');
    anchor.lang = 'en';
    sources.append(anchor);
  }
  elements.details.dataset.tone = entry.tone;
  elements.details.replaceChildren(heading, info, related, sources);
}

async function loadEntryDetails(id, retry = false) {
  if (retry) detailCache.delete(id);
  if (!detailCache.has(id)) {
    const url = new URL(`entries/${encodeURIComponent(id)}.json`, dataDirectory);
    const request = fetch(url, { cache: 'no-cache' }).then(async (response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}：${url}`);
      const payload = await response.json();
      if (payload?.schemaVersion !== 1 || payload.entry?.id !== id
        || !Array.isArray(payload.entry.facts) || !Array.isArray(payload.entry.traits)
        || !Array.isArray(payload.entry.links) || !Array.isArray(payload.entry.sources)) {
        throw new Error(`條目 JSON 格式或 ID 不符：${url}`);
      }
      return payload.entry;
    }).catch((error) => {
      detailCache.delete(id);
      throw error;
    });
    detailCache.set(id, request);
  }
  return detailCache.get(id);
}

async function renderDetails(summary, layout, missing, retry = false) {
  const requestToken = ++detailRequestToken;
  if (!summary) {
    elements.details.setAttribute('aria-busy', 'false');
    const title = node('h2', '', missing ? ui.missing : ui.empty);
    elements.details.replaceChildren(title);
    if (missing) {
      elements.details.append(link(`#${allCategory.id}//${layout}`, ui.home, 'source'));
    }
    return;
  }
  delete elements.details.dataset.tone;
  elements.details.setAttribute('aria-busy', 'true');
  const loading = node('p', 'detail-loading', ui.loading);
  loading.setAttribute('role', 'status');
  elements.details.replaceChildren(loading);
  try {
    const entry = await loadEntryDetails(summary.id, retry);
    if (requestToken !== detailRequestToken) return;
    elements.details.setAttribute('aria-busy', 'false');
    renderDetailsContent(entry, layout);
  } catch (error) {
    console.error(`載入條目 ${summary.id} 失敗`, error);
    if (requestToken !== detailRequestToken) return;
    elements.details.setAttribute('aria-busy', 'false');
    const retryButton = node('button', 'retry', ui.retry);
    retryButton.type = 'button';
    retryButton.addEventListener('click', () => { void renderDetails(summary, layout, false, true); });
    const errorMessage = node('p', 'detail-error', ui.detailError);
    errorMessage.setAttribute('role', 'alert');
    elements.details.replaceChildren(errorMessage, retryButton);
  }
}

function render() {
  const focusedKey = document.activeElement?.dataset.focusTarget ?? document.activeElement?.dataset.focusKey;
  const { category, entry, layout, missing } = resolveRoute(location.hash, categories, entries);
  mobileItemIcon.hidden = !entry;
  if (entry) {
    mobileItemIcon.src = iconAssetUrl(entry.icon).href;
    mobileItemName.textContent = message(entry.name);
  } else {
    mobileItemIcon.removeAttribute('src');
    mobileItemName.textContent = ui.chooseItem;
  }
  openDetails.disabled = !entry;
  inventoryColumnsControl.hidden = layout !== 'inventory';
  inventoryColumnsSelect.value = String(inventoryColumnCount);
  elements.slots.style.setProperty('--inventory-columns', String(inventoryColumnCount));
  elements.slots.style.setProperty('--inventory-gap-count', String(inventoryColumnCount - 1));
  elements.workspace.dataset.layout = layout;
  document.documentElement.dataset.layout = layout;
  syncMobileActionPlacement();
  updateLanguageLinks();
  for (const button of layoutButtons) button.setAttribute('aria-pressed', String(button.value === layout));

  elements.categories.replaceChildren(...[allCategory, ...categories].map((item) => {
    const available = listEntries(item, categories, entries);
    const first = item === allCategory && available.includes(entry) ? entry : available[0];
    const anchor = link(first ? entryHash(first, layout, item.id) : `#${item.id}//${layout}`, item === allCategory ? ui.all : message(item.label), 'category');
    if (item.icon) anchor.prepend(icon(item.icon));
    anchor.dataset.focusKey = `category-${item.id}`;
    if (item.id === category?.id) anchor.setAttribute('aria-current', 'true');
    return anchor;
  }));

  const listed = listEntries(category, categories, entries);
  elements['collection-title'].textContent = category === allCategory ? ui.all : category?.label[lang] ?? ui.title;
  elements.count.textContent = ui.count(listed.length);
  const slots = listed.map((item) => {
    const slot = node('li', 'slot');
    const anchor = link(entryHash(item, layout, category.id), '', 'slot-link');
    anchor.dataset.tone = item.tone;
    anchor.dataset.focusKey = `entry-${item.id}`;
    const label = node('span', 'slot-name', message(item.name));
    anchor.append(icon(item.icon), label);
    if (item.id === entry?.id) anchor.setAttribute('aria-current', 'true');
    slot.append(anchor);
    return slot;
  });
  if (layout === 'inventory' && category) {
    const emptyCount = getInventoryEmptySlotCount(slots.length, inventoryColumnCount);
    for (let i = 0; i < emptyCount; i++) {
      const empty = node('li', 'slot slot-empty');
      empty.setAttribute('aria-hidden', 'true');
      slots.push(empty);
    }
  }
  elements.slots.replaceChildren(...slots);
  if (!entry) delete elements.details.dataset.tone;
  void renderDetails(entry, layout, missing);
  const sameControl = [...document.querySelectorAll('[data-focus-key]')]
    .find((control) => control.dataset.focusKey === focusedKey);
  if (dialog.open && focusedKey) {
    dialog.querySelector('button').focus();
  } else {
    sameControl?.focus({ preventScroll: true });
  }
  elements.announcement.textContent = entry ? ui.selected(message(entry.name)) : '';
}

inventoryColumnsSelect.addEventListener('change', () => {
  const nextCount = resolveInventoryColumnCount(inventoryColumnsSelect.value);
  inventoryColumnCount = nextCount;
  const url = new URL(location.href);
  if (nextCount === defaultInventoryColumnCount) url.searchParams.delete('columns');
  else url.searchParams.set('columns', String(nextCount));
  history.replaceState(null, '', url);
  if (catalogReady) render();
});

for (const button of layoutButtons) {
  button.addEventListener('click', () => {
    if (!catalogReady) return;
    const { entry, category, layout } = resolveRoute(location.hash, categories, entries);
    if (layout === button.value) return;
    if (entry) {
      location.hash = entryHash(entry, button.value, category.id);
    } else if (category) {
      location.hash = `#${category.id}//${button.value}`;
    } else {
      location.hash = `#${allCategory.id}//${button.value || defaultLayout}`;
    }
  });
}

document.getElementById('skip').addEventListener('click', (event) => {
  event.preventDefault();
  document.getElementById('catalog').focus();
});
function validateIndex(payload) {
  if (payload?.schemaVersion !== 1 || !Array.isArray(payload.categories) || !Array.isArray(payload.entries)) {
    throw new Error('圖鑑索引 schema 不符。');
  }
  const categoryIds = new Set(payload.categories.map((category) => category?.id));
  const entryIds = new Set(payload.entries.map((entry) => entry?.id));
  const hasLocalizedText = (value) => ['zh-Hant', 'en'].every((language) => typeof value?.[language] === 'string' && value[language].trim());
  if (!categoryIds.size || !entryIds.size || categoryIds.size !== payload.categories.length
    || entryIds.size !== payload.entries.length
    || payload.categories.some((category) => !category?.id || !hasLocalizedText(category.label) || !category?.icon)
    || payload.entries.some((entry) => !entry?.id || !categoryIds.has(entry.category)
      || !hasLocalizedText(entry.name) || !hasLocalizedText(entry.badge) || !entry?.icon
      || !['steel', 'gold', 'violet'].includes(entry.tone))) {
    throw new Error('圖鑑索引包含重複或不完整資料。');
  }
}

function showCatalogError(error) {
  console.error('載入圖鑑索引失敗', error);
  catalogReady = false;
  elements.categories.replaceChildren();
  elements['collection-title'].textContent = ui.loadError;
  elements.count.textContent = '';
  elements.slots.replaceChildren();
  delete elements.details.dataset.tone;
  elements.details.setAttribute('aria-busy', 'false');
  const retryButton = node('button', 'retry', ui.retry);
  retryButton.type = 'button';
  retryButton.addEventListener('click', () => { void initializeCatalog(); });
  elements.details.replaceChildren(retryButton);
  elements.announcement.textContent = ui.loadError;
}

async function initializeCatalog() {
  const url = new URL('catalog-index.json', dataDirectory);
  try {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}：${url}`);
    const payload = await response.json();
    validateIndex(payload);
    categories = payload.categories;
    entries = payload.entries;
    catalogReady = true;
    render();
    syncDetailsPlacement();
    if (mobile.matches && params.get('open') === '1') {
      openDetails.focus({ preventScroll: true });
      dialog.showModal();
    }
  } catch (error) {
    showCatalogError(error);
  }
}

window.addEventListener('hashchange', () => {
  if (catalogReady) render();
});
void initializeCatalog();
syncDetailsPlacement();
