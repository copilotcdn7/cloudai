const http = require('http');
const httpProxy = require('http-proxy');

// ─── SUNUCU LISTESI ──────────────────────────────────────────────
const SERVERS = {
    '/DE': { target: process.env.SERVER_DE || '89.169.53.227', port: process.env.PORT_DE || '443' },
    '/FR': { target: process.env.SERVER_FR || '194.33.34.66', port: process.env.PORT_FR || '443' },
};
// ─────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 8080;

// Her aktif sunucu icin baglanti olustur
const proxies = {};
for (const [path, cfg] of Object.entries(SERVERS)) {
    if (!cfg.target) continue;

    const url = `https://${cfg.target}:${cfg.port}`;
    proxies[path] = httpProxy.createProxyServer({
        target: url,
        ws: true,
        secure: false,
        changeOrigin: true,
        proxyTimeout: 0,
        timeout: 0,
    });

    proxies[path].on('error', (err) => {
        console.error(`[${path}] Baglanti hatasi:`, err.message);
    });

    console.log(`Aktif: ${path} → ${cfg.target}:${cfg.port}`);
}

// HTTP sunucusu
const server = http.createServer((req, res) => {
    const segment = '/' + (req.url.split('/')[1] || '');
    const proxy = proxies[segment];

    if (!proxy) {
        if (req.url === '/' || req.url === '') {
            const active = Object.keys(proxies);
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end([
                'Cloud Run Multi-Server',
                '======================',
                `Aktif sunucu: ${active.length}`,
                ...active.map(p => `  ${p} → ${SERVERS[p].target}:${SERVERS[p].port}`),
            ].join('\n'));
            return;
        }
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`Bulunamadi: ${segment} | Aktif: ${Object.keys(proxies).join(', ')}`);
        return;
    }

    req.url = req.url.substring(segment.length) || '/';
    proxy.web(req, res);
});

// WebSocket destegi
server.on('upgrade', (req, socket, head) => {
    const segment = '/' + (req.url.split('/')[1] || '');
    const proxy = proxies[segment];

    if (!proxy) {
        socket.destroy();
        return;
    }

    req.url = req.url.substring(segment.length) || '/';
    proxy.ws(req, socket, head);
});

server.setTimeout(0);
server.listen(PORT, () => {
    console.log(`\n=== Sunucu calisiyor (port: ${PORT}) ===`);
    console.log(`Aktif sunucu sayisi: ${Object.keys(proxies).length}`);
});
