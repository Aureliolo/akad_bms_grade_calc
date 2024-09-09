FROM node:14-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY app.js index.html ./

EXPOSE 3000

CMD ["node", "app.js"]
