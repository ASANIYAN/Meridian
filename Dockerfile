# syntax=docker/dockerfile:1

# Production image for the Meridian SPA (FE-SETUP-7): build the static bundle
# with Node, then serve it with nginx as a plain static file server — the app
# calls the API directly (see nginx.conf), so nginx has no REST proxying to do.

# --- Stage 1: build the static bundle ---
FROM node:22-alpine AS build
WORKDIR /app

# Install from the lockfile for reproducible builds; this layer is cached until
# dependencies change.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_API_URL is baked into the bundle at build time and validated by
# src/config/env.ts. The REST client (src/lib/api/client.ts) calls this URL
# directly — same-origin proxying doesn't work on static hosts (Vercel, etc.)
# that have no proxy layer of their own — so the backend must allow this
# deployment's origin via CORS. WS also derives ws(s):// from this same URL
# (the gateway rides the API's own origin/port, no separate WS_PORT). Override
# per deployment:
#   docker build --build-arg VITE_API_URL=https://api.example.com .
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# --- Stage 2: serve with nginx ---
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
