export const wikiOrigin = 'https://minecraft.wiki';

export function wikiArticleTitleFromSource(sourcePage) {
  const url = new URL(sourcePage);
  if (url.origin !== wikiOrigin || !url.pathname.startsWith('/w/')) {
    throw new Error(`Wiki 來源網址格式錯誤：${sourcePage}`);
  }
  const title = decodeURIComponent(url.pathname.slice('/w/'.length)).replaceAll('_', ' ');
  if (!title) throw new Error(`Wiki 來源網址缺少頁名：${sourcePage}`);
  return title;
}
