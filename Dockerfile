FROM node:18.18.2-slim

WORKDIR /app

COPY . /app

RUN npm i -g pnpm \
&& pnpm install

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "dev" ]