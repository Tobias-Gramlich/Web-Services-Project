const TOKEN_KEY = 'ws_project_access_token';
const USER_KEY = 'ws_project_user';
const THEME_KEY = 'ws_project_theme';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) ?? '';
}

export function setStoredToken(token) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setStoredUser(user) {
  if (!user) {
    localStorage.removeItem(USER_KEY);
    return;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredTheme() {
  const raw = localStorage.getItem(THEME_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(THEME_KEY);
    return null;
  }
}

export function setStoredTheme(theme) {
  if (!theme) {
    localStorage.removeItem(THEME_KEY);
    return;
  }
  localStorage.setItem(THEME_KEY, JSON.stringify(theme));
}
