import { config } from './config';
import { requestJson } from './http';

const primaryBase = `${config.userApiBaseUrl}/users`;
const fallbackBase = `${config.userApiBaseUrl}/Users`;

async function callUserEndpoint(path, options) {
  try {
    return await requestJson(`${primaryBase}${path}`, options);
  } catch (error) {
    const fallbackMessages = ['HTTP 404', 'Failed to fetch', 'Cannot'];
    const shouldFallback = fallbackMessages.some((fragment) => error.message.includes(fragment));

    if (!shouldFallback) {
      throw error;
    }

    return requestJson(`${fallbackBase}${path}`, options);
  }
}

export const userApi = {
  register: (payload) =>
    callUserEndpoint('/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  resendActivationMail: (payload) =>
    callUserEndpoint('/send_email', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  activate: (payload) =>
    callUserEndpoint('/activate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    callUserEndpoint('/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  auth: (payload) =>
    callUserEndpoint('/auth', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  changeUsername: (payload) =>
    callUserEndpoint('/change_Username', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  changePassword: (payload) =>
    callUserEndpoint('/change_Password', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteAccount: (payload) =>
    callUserEndpoint('/delete_Account', {
      method: 'DELETE',
      body: JSON.stringify(payload),
    }),
};
