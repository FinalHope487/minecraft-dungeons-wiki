import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { writeCatalogArtifacts } from './catalog.mjs';

const target = process.argv[2] === 'dist' ? '../dist/' : '../';
const root = new URL(target, import.meta.url);
const port = Number(process.env.WIKI_PORT ?? 4173);
if (process.argv[2] !== 'dist') await writeCatalogArtifacts(root);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

createServer(async (request, response) => {
  const path = new URL(request.url, 'http://127.0.0.1').pathname;
  const file = path === '/' ? 'index.html' : path === '/slides/' ? 'slides/index.html' : path === '/llm-wiki/' ? 'llm-wiki/index.html' : path.slice(1);
  if (file !== 'index.html' && file !== 'slides/index.html' && !/^llm-wiki\/(?:raw\/)?[a-z0-9-]+\.html$/.test(file) && !/^(assets(?:\/fonts)?|src|data(?:\/entries)?)\/[a-z0-9-]+\.(css|js|mjs|svg|png|webp|ttf|woff2|txt|json)$/i.test(file)) {
    response.writeHead(404).end('Not found');
    return;
  }
  try {
    const body = await readFile(new URL(file, root));
    response.writeHead(200, { 'Content-Type': types[extname(file)], 'Cache-Control': 'no-store' }).end(body);
  } catch (error) {
    if (error.code === 'ENOENT') {
      response.writeHead(404).end('Not found');
      return;
    }
    console.error(`讀取 ${file} 失敗`, error);
    response.writeHead(500).end('Unable to read site file');
  }
}).listen(port, '127.0.0.1', () => console.log(`Wiki http://127.0.0.1:${port}/`));
