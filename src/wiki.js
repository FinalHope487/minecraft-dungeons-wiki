import { allCategory, defaultLayout, entryHash, listEntries, resolveRoute } from './routes.mjs';
import {
  defaultInventoryColumnCount,
  getInventoryEmptySlotCount,
  inventoryColumnCounts,
  resolveInventoryColumnCount,
} from './inventory-grid.mjs';
import { resolveLanguage, uiText } from './locale.mjs';
import { iconAssetUrl } from './icon-assets.mjs';
import { buildBuiltInEnchantmentPresentation } from './built-in-enchantment-presentation.mjs';

const params = new URLSearchParams(location.search);
const lang = resolveLanguage(location.search);
const ui = uiText[lang];
const fileCatalog = globalThis.__WIKI_FILE_DATA__ ?? null;
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
  ['categories', 'workspace', 'collection', 'collection-title', 'count', 'slots', 'details', 'announcement']
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
elements.collection.setAttribute('aria-label', ui.itemList);
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

function builtInEnchantmentTraitIcon(enchantmentIcon, propertyIcon) {
  const stack = node('span', 'built-in-enchantment-trait-icon');
  stack.setAttribute('aria-hidden', 'true');
  const frame = node('span', 'built-in-enchantment-overlay-frame');
  frame.append(icon(enchantmentIcon, 'built-in-enchantment-overlay'));
  stack.append(icon(propertyIcon, 'built-in-property-icon'), frame);
  return stack;
}

function link(href, label, className) {
  const anchor = node('a', className, label);
  anchor.href = href;
  return anchor;
}

// Collapse only pairs whose player and mob effects share the same core effect.
const sameEffectEnchantments = new Set([
  'burning', 'chilling', 'cowardice', 'fire-aspect', 'growing', 'gravity', 'jungle-poison', 'power',
  'rapid-fire', 'weakening',
]);

function factValue(entry, label) {
  return entry.facts.find((fact) => fact.label.en === label)?.value.en ?? '';
}

function renderEnchantmentEffects(entry, info) {
  const heroAvailability = factValue(entry, 'Hero availability');
  const mobAvailability = factValue(entry, 'Mob availability');
  const playerEffect = entry.facts.find((fact) => fact.label.en === 'Player effect');
  const mobEffect = entry.facts.find((fact) => fact.label.en === 'Mob effect');
  const wikiVerification = /\[verify\]/i.test(factValue(entry, 'Evidence confidence'));
  const playerAvailable = heroAvailability
    && !/^(Unavailable|Unconfirmed|Not available)/i.test(heroAvailability);
  const mobAvailable = mobAvailability
    && !/^(No enemy|No mob|Unconfirmed)/i.test(mobAvailability);
  const showPlayer = playerAvailable && playerEffect
    && !/not available to heroes|unavailable to heroes/i.test(playerEffect.value.en);
  const showMob = mobAvailable && mobEffect
    && !/no mob-side effect is listed|unconfirmed/i.test(mobEffect.value.en);

  if (showPlayer) {
    const effect = node('p', 'enchantment-effect');
    effect.append(node('strong', 'effect-label', ui.playerEffect),
      document.createTextNode(' '), document.createTextNode(playerEffect.value[lang]));
    info.append(effect);
  }
  if (showMob) {
    const sameEffect = showPlayer && sameEffectEnchantments.has(entry.id);
    const effect = node('p', sameEffect ? 'effect-note' : 'enchantment-effect');
    if (sameEffect) {
      effect.append(node('strong', 'effect-label', ui.mobNote),
        document.createTextNode(' '), document.createTextNode(ui.sameMobEffect));
    } else {
      effect.append(node('strong', 'effect-label', ui.mobEffect),
        document.createTextNode(' '), document.createTextNode(mobEffect.value[lang]));
      if (wikiVerification) effect.append(document.createTextNode(' '),
        node('small', 'effect-verification', ui.wikiVerify));
    }
    info.append(effect);
  }
}

function isWikiDescription(entry) {
  return !/^Wiki does not provide an in-game description\.?$/i.test(entry.description.en.trim());
}

function renderDetailsContent(entry, layout) {
  const presentation = buildBuiltInEnchantmentPresentation(entry, entries);
  const heading = node('header', 'detail-heading');
  const identity = node('div', 'identity');
  const badge = node('span', 'rarity', message(entry.badge));
  const implementation = node('span', `implementation-status${entry.implemented ? '' : ' is-unimplemented'}`,
    entry.implemented ? ui.implemented : ui.unimplemented);
  const seasonal = entry.seasonal ? node('span', 'seasonal-status', ui.seasonal) : null;
  const name = node('h2', 'item-name', message(entry.name));
  identity.append(badge, implementation);
  if (seasonal) identity.append(seasonal);
  identity.append(name);
  heading.append(identity, icon(entry.icon, 'item-art'));

  const info = node('div', 'info');
  const moreContent = node('div', 'more-info-content');
  const primaryFacts = node('dl', 'facts');
  const assessmentFacts = node('dl', 'facts');
  const inferredFactLabels = new Set(['Audience', 'Evidence confidence', 'Mob availability']);
  for (const fact of entry.facts) {
    const isEffect = entry.category === 'enchantments'
      && ['Player effect', 'Mob effect'].includes(fact.label.en);
    const pair = node('div', 'fact');
    pair.append(node('dt', '', message(fact.label)), node('dd', '', message(fact.value)));
    if (entry.category === 'enchantments' && inferredFactLabels.has(fact.label.en)) {
      assessmentFacts.append(pair);
    } else if (!isEffect) {
      primaryFacts.append(pair);
    }
  }
  if (entry.category === 'enchantments') renderEnchantmentEffects(entry, info);
  if (primaryFacts.children.length) info.append(primaryFacts);
  for (const trait of presentation.traits) {
    const line = node('p', 'trait');
    line.dataset.traitIcon = trait.icon;
    const label = node('span', '', message(trait.label));
    if (trait.builtInEnchantmentIcon) {
      line.append(builtInEnchantmentTraitIcon(trait.builtInEnchantmentIcon.icon,
        trait.builtInEnchantmentIcon.propertyIcon), label);
    } else {
      line.append(icon(trait.icon), label);
    }
    info.append(line);
  }
  if (entry.category !== 'enchantments' && isWikiDescription(entry)) {
    info.append(node('p', 'description', message(entry.description)));
  }
  if (entry.category === 'enchantments' || (isWikiDescription(entry) && lang === 'zh-Hant')) {
    const original = node('section', 'original');
    original.append(node('h3', 'assessment-title', entry.category === 'enchantments' ? ui.wikiDescription : ui.original));
    const addQuote = (label, value, verified = false) => {
      const quote = node('p', 'description');
      quote.lang = 'en';
      quote.append(node('strong', 'effect-label', `${label}: `), document.createTextNode(value));
      if (verified) quote.append(document.createTextNode(' [verify]'));
      original.append(quote);
    };
    if (entry.category === 'enchantments') {
      const playerEffect = entry.facts.find((fact) => fact.label.en === 'Player effect');
      const mobEffect = entry.facts.find((fact) => fact.label.en === 'Mob effect');
      if (isWikiDescription(entry)) addQuote('In-game description', entry.description.en);
      if (playerEffect && (!isWikiDescription(entry) || playerEffect.value.en !== entry.description.en)) {
        addQuote('Player effect', playerEffect.value.en);
      }
      if (mobEffect && !/no mob-side effect is listed|unconfirmed/i.test(mobEffect.value.en)) {
        addQuote('Mob effect', mobEffect.value.en, /\[verify\]/i.test(factValue(entry, 'Evidence confidence')));
      }
    } else if (isWikiDescription(entry)) {
      addQuote('Original', entry.description.en);
    }
    if (original.children.length > 1) moreContent.append(original);
  }

  if (assessmentFacts.children.length) {
    const assessment = node('section', 'assessment');
    assessment.append(node('h3', 'assessment-title', ui.assessment), assessmentFacts);
    moreContent.append(assessment);
  }

  const related = node('div', 'related');
  if (entry.links.length) {
    related.append(node('h3', '', ui.related));
    const list = node('ul', 'related-list');
    for (const relation of presentation.related) {
      const { target } = relation;
      const item = node('li');
      const anchor = link(entryHash(target, layout), '', 'related-link');
      anchor.dataset.focusTarget = `entry-${target.id}`;
      const label = node('span');
      const targetName = node('strong', '', message(target.name));
      label.append(targetName, node('small', '', message(relation.label)));
      anchor.append(icon(target.icon));
      if (relation.builtInEnchantment) {
        const rankLabel = relation.builtInEnchantment.tier === null
          ? ui.unranked
          : ui.tier(relation.builtInEnchantment.tier);
        label.append(node('small', 'relation-tier', rankLabel));
      }
      anchor.append(label);
      item.append(anchor);
      list.append(item);
    }
    related.append(list);
    info.append(related);
  }
  const sources = node('div', 'sources');
  sources.append(node('span', 'source-caption', ui.sources));
  for (const source of entry.sources) {
    const anchor = link(source.url, source.label, 'source');
    anchor.lang = 'en';
    sources.append(anchor);
  }
  const hasSources = sources.children.length > 1;
  const moreInfo = node('details', 'more-info');
  if (moreContent.children.length) moreInfo.append(node('summary', '', ui.moreInfo), moreContent);
  elements.details.dataset.tone = entry.tone;
  const content = [heading, info];
  if (moreInfo.children.length) content.push(moreInfo);
  if (hasSources) content.push(sources);
  elements.details.replaceChildren(...content);
}

async function loadEntryDetails(id, retry = false) {
  if (retry) detailCache.delete(id);
  if (!detailCache.has(id)) {
    const request = (async () => {
      let payload;
      if (fileCatalog) {
        payload = fileCatalog.entries[id];
        if (!payload) throw new Error(`離線圖鑑缺少條目資料：${id}`);
      } else {
        const url = new URL(`entries/${encodeURIComponent(id)}.json`, dataDirectory);
        const response = await fetch(url, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`HTTP ${response.status}：${url}`);
        payload = await response.json();
      }
      if (payload?.schemaVersion !== 5 || payload.entry?.id !== id
        || typeof payload.entry.implemented !== 'boolean'
        || typeof payload.entry.seasonal !== 'boolean'
        || !Array.isArray(payload.entry.facts) || !Array.isArray(payload.entry.traits)
        || !Array.isArray(payload.entry.links) || !Array.isArray(payload.entry.sources)) {
        throw new Error(`條目 JSON 格式或 ID 不符：${id}`);
      }
      return payload.entry;
    })().catch((error) => {
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
    if (!item.implemented) {
      const status = node('span', 'slot-status', ui.unimplemented);
      status.setAttribute('aria-label', ui.unimplemented);
      anchor.append(status);
    }
    if (item.seasonal) {
      const seasonal = node('span', 'slot-seasonal-status', ui.seasonal);
      seasonal.setAttribute('aria-label', ui.seasonal);
      anchor.append(seasonal);
    }
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
  elements.slots.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
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
  if (payload?.schemaVersion !== 5 || !Array.isArray(payload.categories) || !Array.isArray(payload.entries)) {
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
      || !['steel', 'gold', 'violet'].includes(entry.tone) || typeof entry.implemented !== 'boolean'
      || typeof entry.seasonal !== 'boolean')) {
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
  try {
    let payload;
    if (fileCatalog) {
      payload = fileCatalog.index;
      if (!payload) throw new Error('離線圖鑑缺少分類索引。');
    } else {
      const url = new URL('catalog-index.json', dataDirectory);
      const response = await fetch(url, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}：${url}`);
      payload = await response.json();
    }
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
