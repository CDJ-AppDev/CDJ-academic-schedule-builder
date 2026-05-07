FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY db/db-server.js ./server.js
COPY db/db-env ./.env

EXPOSE 3000

CMD ["node", "server.js"]