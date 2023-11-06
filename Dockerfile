FROM node:18.18.2-slim

WORKDIR /app

COPY . /app

RUN npm install \
&& npm run build

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "start" ]