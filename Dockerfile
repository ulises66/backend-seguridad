# Backend Dockerfile (Node + Express + Knex)
FROM node:20-alpine

# 1) Workdir
WORKDIR /usr/src/app

# 2) Instala dependencias
COPY package*.json ./
# Si usas knex CLI en runtime, instálalo como dependencia normal (no dev)
RUN npm install --production

# 3) Copia el resto del código
COPY . .

# 4) Expone el puerto del backend
EXPOSE 4000

# 5) Inicia el servidor
CMD ["node", "index.js"]
