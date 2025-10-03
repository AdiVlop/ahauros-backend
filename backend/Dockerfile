# Imagine de bază
FROM node:18-alpine

# Setează directorul de lucru
WORKDIR /app

# Copiază package.json și package-lock.json
COPY package*.json ./

# Instalează dependențele
RUN npm install --production

# Copiază restul codului
COPY . .

# Setează variabilele de mediu
ENV NODE_ENV=production
ENV PORT=3001
ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV ANDREEA_SERVICE_URL=$ANDREEA_SERVICE_URL

# Expune portul 3001
EXPOSE 3001

# Rulează aplicația cu PM2
CMD ["npx", "pm2-runtime", "src/server.js"]
