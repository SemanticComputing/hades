FROM node:9-alpine

WORKDIR /app

RUN apk add --no-cache git
RUN npm install -g serve

COPY *.json ./
RUN npm install

COPY . ./

RUN npm run build

EXPOSE 8080

USER 9974

CMD serve --port 3000 -s dist
