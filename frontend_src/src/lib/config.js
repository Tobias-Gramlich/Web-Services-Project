const skyjoHttpBase = import.meta.env.VITE_SKYJO_API_BASE || 'http://10.50.15.53:3002';

export const config = {
  userApiBase: import.meta.env.VITE_USER_API_BASE || 'http://10.50.15.53:3002',
  matchmakingHttpBase: import.meta.env.VITE_MATCHMAKING_HTTP_BASE || 'http://10.50.15.53:3001',
  matchmakingWsUrl: import.meta.env.VITE_MATCHMAKING_WS_URL || 'ws://10.50.15.53:8083',
  colorApiBase: import.meta.env.VITE_COLOR_API_BASE || 'http://10.50.15.53:3003',
  skyjoApiBase: "http://10.50.15.53:8090",
  skyjoWsBase:"ws://10.50.15.53:8090"}