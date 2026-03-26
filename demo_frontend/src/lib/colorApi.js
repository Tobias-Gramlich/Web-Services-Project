import { config } from './config';
import { requestJson } from './http';

export async function fetchScheme() {
  return requestJson(`${config.colorApiBaseUrl}/scheme`, {
    method: 'GET',
  });
}

export async function postScheme(payload) {
  return requestJson(`${config.colorApiBaseUrl}/scheme`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
