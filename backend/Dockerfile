FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all the remaining application files
COPY . .

EXPOSE 3000

CMD ["npm", "start"]