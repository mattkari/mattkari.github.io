// A static file server that resolves addresses the way GitHub Pages does:
// /writing -> writing.html, /articles/x/ -> articles/x/index.html, and
// 404.html (with a 404 status) for anything else. Used only by the tests.
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? 'out');
const port = Number(process.argv[3] ?? 4173);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
};

const isFile = (path) => existsSync(path) && statSync(path).isFile();

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const target = join(root, normalize(pathname));
  const candidates = pathname.endsWith('/')
    ? [join(target, 'index.html')]
    : [target, `${target}.html`, join(target, 'index.html')];

  let file = target.startsWith(root) ? candidates.find(isFile) : undefined;
  let status = 200;
  if (!file) {
    file = join(root, '404.html');
    status = 404;
  }
  response.writeHead(status, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(response);
}).listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));
