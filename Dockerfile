FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app

COPY --from=build /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "--input-type=module", "-e", "import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; const port = Number(process.env.PORT || 8080); const dist = path.resolve('dist'); const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2' }; http.createServer((req, res) => { const u = decodeURIComponent((req.url || '/').split('?')[0]); let f = path.join(dist, u === '/' ? 'index.html' : u); if (!f.startsWith(dist) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(dist, 'index.html'); const ext = path.extname(f).toLowerCase(); res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' }); if (req.method === 'HEAD') return res.end(); fs.createReadStream(f).pipe(res); }).listen(port, '0.0.0.0', () => console.log('Listening on 0.0.0.0:' + port));"]
