const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

// ─── SUNUCU LISTESI ──────────────────────────────────────────────
const SERVERS = {
    '/DE': { target: process.env.SERVER_DE || '89.169.53.227', port: process.env.PORT_DE || '443' },
    '/FR': { target: process.env.SERVER_FR || '194.33.34.66', port: process.env.PORT_FR || '443' },
};
// ─────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 8080;
const app = express();

// Ana sayfa - bad request vermemek icin
app.get('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<html><body><h2>OK</h2></body></html>');
});

// Her sunucu icin proxy tanimla
for (const [path, cfg] of Object.entries(SERVERS)) {
    if (!cfg.target) continue;

    const targetUrl = `https://${cfg.target}:${cfg.port}`;

    app.use(path, createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        ws: true,
        secure: true,
        pathRewrite: { [`^${path}`]: '' },
        on: {
            proxyReq: (proxyReq) => {
                proxyReq.setHeader('Host', cfg.target);
            },
            proxyReqWs: (proxyReq) => {
                proxyReq.setHeader('Host', cfg.target);
            },
            error: (err, req, res) => {
                console.error(`[${path}] Hata:`, err.message);
                if (res && res.writeHead) {
                    res.writeHead(502);
                    res.end('Baglanti hatasi');
                }
            }
        }
    }));

    console.log(`Aktif: ${path} → ${targetUrl}`);
}

const server = app.listen(PORT, () => {
    console.log(`\n=== Sunucu calisiyor (port: ${PORT}) ===`);
    console.log(`Aktif sunucu sayisi: ${Object.keys(SERVERS).length}`);
});

server.setTimeout(0);

