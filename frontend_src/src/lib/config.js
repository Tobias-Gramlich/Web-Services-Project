const skyjoHttpBase = import.meta.env.VITE_SKYJO_API_BASE || 'http://localhost:8090';

export const config = {
  userApiBase: import.meta.env.VITE_USER_API_BASE || 'http://localhost:3001',
  matchmakingHttpBase: import.meta.env.VITE_MATCHMAKING_HTTP_BASE || 'http://localhost:3002',
  matchmakingWsUrl: import.meta.env.VITE_MATCHMAKING_WS_URL || 'ws://localhost:8080',
  colorApiBase: import.meta.env.VITE_COLOR_API_BASE || 'http://localhost:3003',
  skyjoApiBase: skyjoHttpBase,
  skyjoWsBase:
    import.meta.env.VITE_SKYJO_WS_BASE ||
    skyjoHttpBase.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://'),
};