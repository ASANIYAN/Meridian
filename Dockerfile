# syntax=docker/dockerfile:1

# Production image for the Meridian SPA (FE-SETUP-7): build the static bundle
# with Node, then serve it with nginx (which also same-origin-proxies /v1 to the
# API — see nginx.conf.template).

# --- Stage 1: build the static bundle ---
FROM node:22-alpine AS build
WORKDIR /app

# Install from the lockfile for reproducible builds; this layer is cached until
# dependencies change.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_* are baked into the bundle at build time and validated by src/config/env.ts,
# so both must be valid URLs. VITE_API_URL is only used by the dev proxy/env check
# (the client calls the relative /v1 in production), but VITE_WS_URL is the real
# WebSocket gateway the browser connects to — override it per deployment:
#   docker build --build-arg VITE_WS_URL=wss://gateway.example.com .
ARG VITE_API_URL=http://localhost:8000
ARG VITE_WS_URL=ws://localhost:8001
ENV VITE_API_URL=$VITE_API_URL \
    VITE_WS_URL=$VITE_WS_URL
RUN npm run build

# --- Stage 2: serve with nginx ---
FROM nginx:1.27-alpine AS runtime

# The REST API origin the /v1 block proxies to, substituted into the nginx config
# at container start. Override per environment:
#   docker run -e API_UPSTREAM=http://api.internal:8000 ...
ENV API_UPSTREAM=http://api:8000

# Opt into the image's resolver-discovery script so it populates
# NGINX_LOCAL_RESOLVERS from the container's /etc/resolv.conf (used by the /v1
# block's runtime resolver). The filter pins envsubst to just these two vars, so
# nginx's own $host/$uri/$request_uri are never touched.
ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1
ENV NGINX_ENVSUBST_FILTER=^(API_UPSTREAM|NGINX_LOCAL_RESOLVERS)\$

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
# nginx:alpine's entrypoint runs envsubst over /etc/nginx/templates, then starts
# nginx in the foreground — no CMD override needed.
