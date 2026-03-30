FROM node:20-alpine AS build

# 1. Deklariere die Argumente (Werte kommen vom 'docker build --build-arg ...')
ARG VITE_MATCHMAKING_WS_URL
ARG VITE_USER_API_BASE
ARG VITE_COLOR_API_BASE
ARG VITE_SKYJO_API_BASE

# 2. Mache sie als Umgebungsvariablen für den Build-Prozess verfügbar
ENV VITE_MATCHMAKING_WS_URL=$VITE_MATCHMAKING_WS_URL
ENV VITE_USER_API_BASE=$VITE_USER_API_BASE
ENV VITE_COLOR_API_BASE=$VITE_COLOR_API_BASE
ENV VITE_SKYJO_API_BASE=$VITE_SKYJO_API_BASE

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# JETZT wird das React-Frontend mit den richtigen IPs gebaut
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY server.js ./server.js
EXPOSE 3000
CMD ["node", "server.js"]