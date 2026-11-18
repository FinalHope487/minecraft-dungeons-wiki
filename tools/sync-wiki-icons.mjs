import { mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog } from './catalog.mjs';
import { wikiArticleTitleFromSource, wikiOrigin } from './wiki-page-title.mjs';

const API_URL = new URL('/api.php', wikiOrigin);
const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const USER_AGENT = 'MinecraftDungeonsWikiIconSync/1.0 (local asset maintenance)';
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const iconCatalog = loadCatalog();
const iconAssetById = new Map(iconCatalog.iconAssets.map((asset) => [asset.id, asset]));
const sourceEntries = iconCatalog.iconAssets.filter((asset) => asset.sourcePage && asset.wikiFileTitle)
  .map((asset) => ({
    id: asset.id,
    page: wikiArticleTitleFromSource(asset.sourcePage),
    fileTitle: asset.wikiFileTitle,
  }));

function pageUrl(pageTitle) {
  const encodedTitle = encodeURIComponent(pageTitle.replaceAll(' ', '_'));
  return new URL('/w/' + encodedTitle, wikiOrigin).toString();
}

function filePageUrl(fileTitle) {
  const encodedTitle = encodeURIComponent(fileTitle.replaceAll(' ', '_'));
  return new URL('/w/' + encodedTitle, wikiOrigin).toString();
}

function normalizeTitle(title) {
  return title.replace(/^File:/i, '').replaceAll('_', ' ').replace(/\s+/g, ' ').trim().toLocaleLowerCase('en-US');
}

function apiRequestUrl(parameters) {
  const url = new URL(API_URL);
  for (const [key, value] of Object.entries(parameters)) url.searchParams.set(key, value);
  return url;
}

async function readApiJson(parameters) {
  const url = apiRequestUrl(parameters);
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
    signal: AbortSignal.timeout(30_000),
  });
  const body = await response.text();

  if (!response.ok) {
    throw new Error('Wiki API returned HTTP ' + response.status + ' for ' + url.pathname + '. Response: ' + body.slice(0, 240));
  }
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Wiki API did not return JSON for ' + url.pathname + '. Response: ' + body.slice(0, 240));
  }

  let data;
  try {
    data = JSON.parse(body);
  } catch (error) {
    throw new Error('Wiki API returned invalid JSON for ' + url.pathname, { cause: error });
  }
  if (data.error) {
    throw new Error('Wiki API error ' + data.error.code + ': ' + data.error.info);
  }
  return data;
}

async function findPageImage(entry) {
  const wanted = normalizeTitle(entry.fileTitle);
  let continuation;
  let checkedImages = 0;
  for (let pageNumber = 0; pageNumber < 100; pageNumber += 1) {
    const data = await readApiJson({
      action: 'query',
      format: 'json',
      imlimit: 'max',
      prop: 'images',
      titles: entry.page,
      ...continuation,
    });
    const pages = Object.values(data.query?.pages ?? {});
    const page = pages.find((candidate) => !candidate.missing);
    if (!page) throw new Error('Wiki article is missing: ' + entry.page);

    const pageImages = (page.images ?? []).map((image) => image.title);
    const match = pageImages.find((title) => normalizeTitle(title) === wanted);
    if (match) return match;

    checkedImages += pageImages.length;
    continuation = data.continue;
    if (!continuation) break;
    if (pageNumber === 99) {
      throw new Error('Wiki image lookup exceeded 100 continuation pages for ' + entry.page + '.');
    }
  }

  throw new Error('Expected file ' + entry.fileTitle + ' is no longer embedded on ' + entry.page + '. Checked ' + checkedImages + ' images.');
}

async function loadCurrentFileInfo(fileTitles) {
  const result = new Map();

  for (let offset = 0; offset < fileTitles.length; offset += 50) {
    const titles = fileTitles.slice(offset, offset + 50);
    const data = await readApiJson({
      action: 'query',
      format: 'json',
      iiprop: 'url|timestamp|sha1|size|mime',
      prop: 'imageinfo',
      titles: titles.join('|'),
    });
    const pages = Object.values(data.query?.pages ?? {});

    for (const page of pages) {
      const info = page.imageinfo?.[0];
      if (page.missing || !info?.url) throw new Error('Wiki file is missing or has no original URL: ' + page.title);
      result.set(normalizeTitle(page.title), { title: page.title, ...info });
    }
  }
  return result;
}

async function downloadPng(info) {
  const url = new URL(info.url);
  if (url.protocol !== 'https:' || url.origin !== wikiOrigin || !url.pathname.startsWith('/images/')) {
    throw new Error('Refusing an unexpected Wiki file host or path: ' + info.url);
  }

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error('Image download returned HTTP ' + response.status + ' for ' + info.title);

  const mime = response.headers.get('content-type')?.split(';', 1)[0].trim().toLocaleLowerCase('en-US');
  if (mime !== 'image/png' || info.mime !== 'image/png') {
    throw new Error('Expected a PNG for ' + info.title + ', received ' + (mime ?? 'unknown MIME type'));
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length === 0 || bytes.length > MAX_FILE_BYTES) {
    throw new Error('Unexpected image size for ' + info.title + ': ' + bytes.length + ' bytes');
  }
  if (!bytes.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    throw new Error('Downloaded content is not a PNG file: ' + info.title);
  }
  return bytes;
}

function getArguments() {
  const args = process.argv.slice(2);
  const unknown = args.filter((arg) => arg !== '--dry-run');
  if (unknown.length) throw new Error('Unknown argument: ' + unknown.join(' '));
  return { dryRun: args.includes('--dry-run') };
}

async function main() {
  const { dryRun } = getArguments();
  const resolvedEntries = sourceEntries.map((entry) => {
    const asset = iconAssetById.get(entry.id);
    if (!asset) throw new Error('Icon ID is not registered: ' + entry.id);
    if (path.basename(asset.file) !== asset.file || path.extname(asset.file).toLocaleLowerCase('en-US') !== '.png') {
      throw new Error('Expected a registered PNG basename for ' + entry.id + ', received ' + asset.file);
    }
    return { ...entry, outputFile: asset.file };
  });

  const verifiedTitles = [];
  for (const entry of resolvedEntries) verifiedTitles.push(await findPageImage(entry));

  const infoByTitle = await loadCurrentFileInfo([...new Set(verifiedTitles)]);
  const records = [];
  const payloads = [];
  for (let index = 0; index < resolvedEntries.length; index += 1) {
    const entry = resolvedEntries[index];
    const title = verifiedTitles[index];
    const info = infoByTitle.get(normalizeTitle(title));
    if (!info) throw new Error('Wiki API did not return image info for ' + title);

    const downloaded = dryRun ? null : await downloadPng(info);
    const record = {
      id: entry.id,
      sourcePage: pageUrl(entry.page),
      wikiFilePage: info.descriptionurl || filePageUrl(title),
      wikiFileTitle: title,
      uploadedAt: info.timestamp,
      wikiSha1: info.sha1,
      wikiBytes: info.size,
      wikiMime: info.mime,
      ...(downloaded && {
        downloadedSha1: createHash('sha1').update(downloaded).digest('hex'),
        downloadedBytes: downloaded.length,
        downloadedMime: 'image/png',
      }),
      localFile: 'assets/' + entry.outputFile,
    };
    records.push(record);
    if (downloaded) payloads.push({ record, bytes: downloaded });
  }

  const manifest = {
    wiki: 'Minecraft Wiki',
    api: API_URL.toString(),
    syncedAt: new Date().toISOString(),
    assets: records,
  };

  if (dryRun) {
    console.log(JSON.stringify(manifest, null, 2));
    return;
  }

  const assetDir = path.join(ROOT, 'assets');
  const manifestPath = path.join(ROOT, 'docs', 'wiki-icon-sync.json');
  await mkdir(assetDir, { recursive: true });
  await mkdir(path.dirname(manifestPath), { recursive: true });
  const stagingDir = await mkdtemp(path.join(ROOT, '.wiki-icon-sync-'));
  try {
    for (const { record, bytes } of payloads) {
      await writeFile(path.join(stagingDir, path.basename(record.localFile)), bytes);
    }
    await writeFile(path.join(stagingDir, 'wiki-icon-sync.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

    for (const { record } of payloads) {
      const destination = path.join(assetDir, path.basename(record.localFile));
      await rename(path.join(stagingDir, path.basename(record.localFile)), destination);
    }
    await rename(path.join(stagingDir, 'wiki-icon-sync.json'), manifestPath);
  } finally {
    await rm(stagingDir, { recursive: true, force: true });
  }

  console.log('Synchronized ' + payloads.length + ' Wiki icons.');
  for (const { record, bytes } of payloads) {
    console.log(record.id + ': ' + record.wikiFileTitle + ' -> ' + record.localFile + ' (' + bytes.length + ' bytes)');
  }
  console.log('Source record: docs/wiki-icon-sync.json');
}

main().catch((error) => {
  console.error('Wiki icon sync failed: ' + (error.stack ?? error));
  process.exitCode = 1;
});
