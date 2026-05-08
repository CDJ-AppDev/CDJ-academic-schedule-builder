FROM node:16-alpine

WORKDIR /app

# Since the Dockerfile is INSIDE the db folder, 
# just refer to the files directly.
COPY package*.json ./
RUN npm install

# Copy the server script and env
COPY db-server.js .
COPY .env .

EXPOSE 3000

CMD ["node", "db-server.js"]