FROM node:16.13-alpine as base

ENV NODE_ENV build

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
USER node

COPY --chown=node:node . .

#######################################

FROM base as server-builder

WORKDIR /home/node/app
USER node

RUN npm i
RUN npm run build:server

#######################################

FROM base as worker-builder

WORKDIR /home/node/app
USER node

RUN npm i
RUN npm run build:worker

#######################################

FROM node:16.13-alpine as server

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /home/node/app
USER node

COPY --from=server-builder --chown=node:node /home/node/app/node_modules ./node_modules
COPY --from=server-builder --chown=node:node /home/node/app/package*.json ./
COPY --from=server-builder --chown=node:node /home/node/app/dist/ ./dist

EXPOSE 3000

CMD ["node", "dist/apps/server/main.js"]


#######################################

FROM node:16.13-slim as worker

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /home/node/app
USER node

COPY --from=worker-builder --chown=node:node /home/node/app/node_modules ./node_modules
COPY --from=worker-builder --chown=node:node /home/node/app/package*.json ./
COPY --from=worker-builder --chown=node:node /home/node/app/dist/ ./dist

EXPOSE 3001

CMD ["node", "dist/apps/worker/main.js"]