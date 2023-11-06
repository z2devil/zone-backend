FROM node:18.18.2-slim

WORKDIR /app

COPY . /app

RUN npm install \
&& npm run build

EXPOSE 2333

ENTRYPOINT [ "npm", "run", "start" ]