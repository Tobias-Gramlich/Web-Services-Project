import { config } from './config';

let socket = null;
let listeners = new Set();

function notify(type, payload) {
  for (const listener of listeners) {
    listener({ type, payload });
  }
}

export function subscribeMatchmaking(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMatchmakingSocket() {
  return socket;
}

export function isMatchmakingConnected() {
  return socket?.readyState === WebSocket.OPEN;
}

export function connectMatchmakingSocket(authToken) {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return socket;
  }

  socket = new WebSocket(config.matchmakingWsUrl);

  socket.onopen = () => {
    notify('open');
    if (authToken) {
      sendMatchmakingMessage('user.authenticate', { accessToken: authToken });
    }
  };

  socket.onmessage = (event) => {
    let parsed = event.data;

    try {
      parsed = JSON.parse(event.data);
    } catch {
      // keep raw text
    }

    notify('message', parsed);
  };

  socket.onerror = () => {
    notify('error');
  };

  socket.onclose = () => {
    notify('close');
  };

  return socket;
}

export function disconnectMatchmakingSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}

export function sendMatchmakingMessage(type, payload = {}) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return false;
  }

  socket.send(JSON.stringify({ type, payload }));
  return true;
}