FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_USER_API_BASE=http://localhost:3001/users
ARG VITE_COLOR_API_BASE=http://localhost:3003
ARG VITE_MATCHMAKING_WS_URL=ws://localhost:8080
ENV VITE_USER_API_BASE=$VITE_USER_API_BASE
ENV VITE_COLOR_API_BASE=$VITE_COLOR_API_BASE
ENV VITE_MATCHMAKING_WS_URL=$VITE_MATCHMAKING_WS_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
