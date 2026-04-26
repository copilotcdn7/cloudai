const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = process.env.PORT || 8080;
const TARGET = process.env.TARGET || 'https://89.169.53.227:443'; // DE default

const app = express();

app.use('/', createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,
    ws: true,
    secure: false,
    on: {
        error: (err, req, res) => {
            console.error('Hata:', err.message);
            if (res && typeof res.writeHead === 'function') {
                res.writeHead(400);
                res.end('Bad Request');
            }
        }
    }
}));

const server = app.listen(PORT, () => {
    console.log(`Calisiyor: port ${PORT} → ${TARGET}`);
});
server.setTimeout(0);


