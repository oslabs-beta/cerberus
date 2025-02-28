#Backend Dockerfile
FROM node:20.18

WORKDIR /usr/src/app

#copy package files and install dependencies
COPY package*.json ./
RUN npm install

#copy server source code
COPY . . 

EXPOSE 3000

CMD ["node", "server.js"]