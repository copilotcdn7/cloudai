FROM node:20-alpine

WORKDIR /app

# Sadece package.json kopyala, npm install yap (cache icin)
COPY package.json ./
RUN npm install --production

# Uygulama dosyasini kopyala
COPY index.js ./

# Cloud Run 8080 bekliyor
EXPOSE 8080

CMD ["node", "index.js"]
