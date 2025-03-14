#frontend dockerfile

FROM node:18-alpine

WORKDIR /usr/src/app

#Copy package files and install dependencies
COPY package*.json ./
RUN npm install

#Copy client source code
COPY client/ ./

#Expose port
EXPOSE 5173

#Default command to start app
CMD ["npm", "run", "dev", "--", "--host"]