FROM keymetrics/pm2:latest-alpine

COPY * /app/

WORKDIR /app/

RUN npm install

RUN ls -l

CMD ["pm2-runtime", "api/index.js"]
