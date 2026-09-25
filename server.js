const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = Number(process.env.PORT || 4173);
const repository = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const branch = process.env.GITHUB_BRANCH || 'main';
const root = __dirname;
const contentTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

function send(response, status, body, headers = {}) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => { body += chunk; if (body.length > 2_000_000) reject(new Error('Payload demasiado grande')); });
    request.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('JSON inválido')); } });
    request.on('error', reject);
  });
}

async function githubRequest(url, options = {}) {
  return fetch(url, { ...options, headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', ...options.headers } });
}

async function syncBudget(request, response) {
  if (!repository || !token) return send(response, 503, { error: 'Configura GITHUB_REPOSITORY y GITHUB_TOKEN en el servidor.' });
  const payload = await readBody(request);
  if (!payload.email || !Array.isArray(payload.budget)) return send(response, 400, { error: 'Faltan email o presupuesto.' });
  const safeEmail = payload.email.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const filePath = `voltio-data/${safeEmail}.json`;
  const apiUrl = `https://api.github.com/repos/${repository}/contents/${filePath}`;
  const content = Buffer.from(JSON.stringify({ email: payload.email, budget: payload.budget, updatedAt: new Date().toISOString() }, null, 2)).toString('base64');
  let sha;
  const current = await githubRequest(`${apiUrl}?ref=${encodeURIComponent(branch)}`);
  if (current.ok) sha = (await current.json()).sha;
  const githubResponse = await githubRequest(apiUrl, { method: 'PUT', body: JSON.stringify({ message: `Actualizar presupuesto Voltio de ${payload.email}`, content, branch, ...(sha ? { sha } : {}) }) });
  if (!githubResponse.ok) return send(response, 502, { error: 'GitHub no pudo guardar el presupuesto.' });
  send(response, 200, { saved: true, file: filePath });
}

function serveStatic(request, response) {
  const requested = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  const filePath = path.resolve(root, `.${requested}`);
  if (!filePath.startsWith(root)) return response.writeHead(403).end();
  fs.readFile(filePath, (error, data) => {
    if (error) return response.writeHead(404).end('Not found');
    response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
    response.end(data);
  });
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && request.url === '/api/health') return send(response, 200, { githubConfigured: Boolean(repository && token) });
    if (request.method === 'POST' && request.url === '/api/sync') return await syncBudget(request, response);
    if (request.method === 'GET') return serveStatic(request, response);
    send(response, 405, { error: 'Método no permitido' });
  } catch (error) {
    send(response, 500, { error: error.message });
  }
});

server.listen(port, () => console.log(`Voltio en http://localhost:${port}`));
