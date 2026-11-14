FROM node:22-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY apps/api/server.ts apps/api/server.ts
RUN pnpm exec esbuild apps/api/server.ts --outfile=apps/api/dist/server.js --bundle --platform=node --format=esm --packages=external

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist/server.js ./apps/api/dist/server.js
COPY infra/schema.sql ./infra/schema.sql
COPY package.json ./package.json
ENV NODE_ENV=production
USER node
CMD ["node", "apps/api/dist/server.js"]
