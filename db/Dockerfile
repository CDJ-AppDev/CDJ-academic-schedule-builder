FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY db/package*.json ./
RUN npm install

# Copy source code
COPY db/db-server.js ./db-server.js
COPY db/.env ./.env

EXPOSE 3000

CMD ["node", "db-server.js"]