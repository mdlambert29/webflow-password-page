// Local test server: serves the mock 401 page and fakes Webflow's /.wf_auth.
// Run: node demo/server.js   then open http://localhost:4173   (test password: "review")
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT || 4173;

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'POST' && url.pathname === '/.wf_auth') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      const f = new URLSearchParams(body);
      const ok = f.get('pass') === 'review';
      res.writeHead(302, { Location: ok ? '/unlocked' : '/?e=1' });
      res.end();
    });
    return;
  }
  if (url.pathname === '/unlocked') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end('<!doctype html><title>Unlocked</title><h1>Unlocked: the protected page would load here</h1>');
  }
  const file = url.pathname === '/' ? 'demo/index.html' : url.pathname.slice(1);
  const full = path.join(ROOT, file);
  if (!full.startsWith(ROOT) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
    res.writeHead(404);
    return res.end('Not found');
  }
  const type = { '.html': 'text/html', '.js': 'text/javascript' }[path.extname(full)] || 'text/plain';
  res.writeHead(200, { 'Content-Type': type + '; charset=utf-8', 'Cache-Control': 'no-store' });
  fs.createReadStream(full).pipe(res);
}).listen(PORT, () => console.log('Password page demo on http://localhost:' + PORT));
