FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app/apps/api
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/package-lock.json /app/
COPY --from=build /app/apps/api/package.json ./
COPY --from=build /app/packages/shared /app/packages/shared
RUN cd /app && npm ci --omit=dev --workspace @questlog/api --include-workspace-root=false
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/drizzle ./drizzle
COPY --from=build /app/apps/web/dist ../web/dist
EXPOSE 3333
CMD ["node", "dist/server.js"]
