import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
export async function staticServer(root = 'dist', port = 0) {
  const base = resolve(root);
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      let file = resolve(base, '.' + decodeURIComponent(url.pathname));
      if (file !== base && !file.startsWith(base + sep)) throw Error('Path');
      if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
      const bytes = await readFile(file);
      const types = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.woff2': 'font/woff2',
        '.pdf': 'application/pdf',
        '.json': 'application/json',
      };
      res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
      res.end(bytes);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
if (process.argv[1]?.endsWith('static-server.mjs')) {
  const s = await staticServer(process.argv[2] || 'dist', Number(process.argv[3] || 4322));
  console.log(`Local: ${s.url}`);
}
