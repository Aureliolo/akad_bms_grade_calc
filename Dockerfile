FROM node:14-alpine

WORKDIR  /usr/app
COPY     package.json /usr/app/package.json
RUN      npm install
COPY     . /usr/app

EXPOSE 80

CMD ["node", "app.js"]
