ARG NODE_VERSION=22-alpine
FROM --platform=linux/amd64 node:${NODE_VERSION}
RUN npm install -g pnpm
WORKDIR /astro-responsive
COPY pnpm-lock.yaml .
RUN pnpm fetch --prod
COPY . .
RUN pnpm install --recursive --offline --prod --frozen-lockfile
USER node
EXPOSE 4321
CMD node dist/server/entry.mjs
