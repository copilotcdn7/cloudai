# Google Cloud Run Multi-Server Proxy

GitHub'a push yap → Cloud Run otomatik build eder.

## Desteklenen Sunucular

| Path | Env Variable | Port Env |
|------|-------------|----------|
| /TR  | VPS_TR      | PORT_TR  |
| /DE  | VPS_DE      | PORT_DE  |
| /FR  | VPS_FR      | PORT_FR  |
| /GB  | VPS_GB      | PORT_GB  |
| /US  | VPS_US      | PORT_US  |
| /NL  | VPS_NL      | PORT_NL  |

## Kurulum

### 1. GitHub'a Push

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/KULLANICI/REPO.git
git push -u origin main
```

### 2. Cloud Build Trigger Bağla

Google Cloud Console → Cloud Build → Triggers → Create Trigger:
- Source: GitHub repo seç
- Branch: main
- Config: `cloudbuild.yaml`

### 3. VPS IP'lerini Ekle

Cloud Run Console → multiproxy servisi → Edit → Environment Variables:
```
VPS_TR = 1.2.3.4
PORT_TR = 443
VPS_DE = 5.6.7.8
PORT_DE = 443
VPS_FR = 9.10.11.12
PORT_FR = 10086
```

Sadece kullandığın sunucuları ekle, diğerleri otomatik devre dışı.

## Client Ayarı

```
Address : xxxxx.run.app
Port    : 443
TLS     : ON
Path    : /TR/senin-vless-path   ← /TR, /DE, /FR vs
```

## Test

```bash
curl https://CLOUDRUN_URL/
# Aktif sunucuları listeler
```
