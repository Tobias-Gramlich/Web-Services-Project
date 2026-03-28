export const config = {
  userApiBaseUrl: import.meta.env.VITE_USER_API_BASE_URL ?? 'http://localhost:3001',
  matchmakingHttpUrl: import.meta.env.VITE_MATCHMAKING_HTTP_URL ?? 'http://localhost:3002',
  matchmakingWsUrl: import.meta.env.VITE_MATCHMAKING_WS_URL ?? 'ws://localhost:8080',
  colorApiBaseUrl: import.meta.env.VITE_COLOR_API_BASE_URL ?? 'http://localhost:3003',
};
