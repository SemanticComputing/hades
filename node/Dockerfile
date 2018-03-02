FROM keymetrics/pm2:latest-alpine

COPY * /app/

WORKDIR /app/

RUN npm install

CMD ["pm2-runtime", "api/index.js"]
