FROM node:alpine

ENV ENV_NAME dev
ENV EGG_SERVER_ENV dev
ENV NODE_ENV dev
ENV NODE_CONFIG_ENV dev

WORKDIR /usr/src/app

COPY package.json .
COPY tsconfig.json .

RUN yarn

COPY lib.ts .
COPY index.ts .
COPY ./templates/ ./templates/

RUN yarn tsc

CMD ["node", "dist/index.js"]