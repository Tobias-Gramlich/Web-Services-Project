const skyjoHttpBase ='http://10.50.15.53:8090';

export const config = {
  userApiBase: 'http://10.50.15.53:3002',
  matchmakingHttpBase: 'http://10.50.15.53:3001',
  matchmakingWsUrl: 'ws://10.50.15.53:8083',
  colorApiBase: 'http://10.50.15.53:3003',
  skyjoApiBase: skyjoHttpBase,
  skyjoWsBase:
    skyjoHttpBase.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://'),
};