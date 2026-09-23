# Single-container image for the AvaRamp web channel:
# the backend serves the built SPA and the API on one origin (:3002).

# --- STAGE 1: dependencies (workspace-aware) ---
FROM node:24-alpine AS deps
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

RUN npm ci

# --- STAGE 2: build SPA + backend ---
FROM deps AS build
COPY . .
RUN npm run build -w @avarampl/frontend && npm run build -w @avarampl/backend

# --- STAGE 3: production-only dependencies ---
FROM deps AS prod-deps
RUN npm prune --omit=dev

# --- STAGE 4: runtime ---
FROM node:24-alpine AS production
RUN apk update && apk add --no-cache su-exec
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002
ENV HOST=0.0.0.0
# SPA is copied to /app/dist/spa; backend runs from /app/backend.
ENV SPA_DIST_DIR=../dist/spa

# Production node_modules (hoisted workspace root) + root manifest.
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/package.json ./package.json

# Compiled backend + its manifest + entrypoint.
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/package.json ./backend/package.json
COPY --from=build /app/backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Built SPA.
COPY --from=build /app/frontend/dist/spa ./dist/spa

RUN mkdir -p /app/logs /app/data /app/backend/logs && chown -R node:node /app/logs /app/data /app/backend/logs

WORKDIR /app/backend

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
