import { config } from './config';
import { parseResponse } from './utils';

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  return parseResponse(response);
}

export const userApi = {
  register: (body) => request(`${config.userApiBase}/users/register`, { method: 'POST', body: JSON.stringify(body) }),
  sendEmail: (body) => request(`${config.userApiBase}/users/send_email`, { method: 'POST', body: JSON.stringify(body) }),
  activate: (body) => request(`${config.userApiBase}/users/activate`, { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request(`${config.userApiBase}/users/login`, { method: 'POST', body: JSON.stringify(body) }),
  auth: (body) => request(`${config.userApiBase}/users/auth`, { method: 'POST', body: JSON.stringify(body) }),
  changeUsername: (body) => request(`${config.userApiBase}/users/change_Username`, { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body) => request(`${config.userApiBase}/users/change_Password`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAccount: (body) => request(`${config.userApiBase}/users/delete_Account`, { method: 'DELETE', body: JSON.stringify(body) }),
};

export const colorApi = {
  getScheme: () => request(`${config.colorApiBase}/scheme`),
  postScheme: (body) => request(`${config.colorApiBase}/scheme`, { method: 'POST', body: JSON.stringify(body) }),
};

export const skyjoApi = {
  getGame: (id) => request(`${config.skyjoApiBase}/getGame-${id}`, { method: 'GET' }),
  getCard: (id, token) =>
    request(`${config.skyjoApiBase}/getCard/${id}`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
  setUpGame: (playerIds) =>
    request(`${config.skyjoApiBase}/setupGame`, {
      method: 'POST',
      body: JSON.stringify(playerIds),
    }),
  move: (body) =>
    request(`${config.skyjoApiBase}/move`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  coordinateRound: (body) =>
    request(`${config.skyjoApiBase}/round`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};