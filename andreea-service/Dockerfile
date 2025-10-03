FROM node:18-alpine
WORKDIR /usr/src/app

# Copiază codul sursă
COPY package*.json ./
RUN npm install --production

COPY . .

# Expune portul
EXPOSE 3002

# Rulează cu PM2 în cluster mode
RUN npm install pm2 -g
CMD ["pm2-runtime", "src/server.js"]
