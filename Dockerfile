# Dockerfile in the project root
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy everything else
COPY . .

# Default command (can be overridden in docker-compose)
CMD ["npm", "run", "dev"]