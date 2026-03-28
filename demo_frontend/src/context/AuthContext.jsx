import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { userApi } from '../lib/userApi';
import { clearStoredAuth, getStoredToken, getStoredUser, setStoredToken, setStoredUser } from '../lib/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState(getStoredUser());
  const [authLoading, setAuthLoading] = useState(Boolean(getStoredToken()));

  useEffect(() => {
    const bootstrapAuth = async () => {
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await userApi.auth({ accessToken: token });
        const nextUser = {
          username: response.username,
          userId: response.userId,
          email: response.email,
        };
        setUser(nextUser);
        setStoredUser(nextUser);
      } catch {
        clearStoredAuth();
        setToken('');
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    bootstrapAuth();
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      authLoading,
      async login(accessToken) {
        setStoredToken(accessToken);
        setToken(accessToken);
        const response = await userApi.auth({ accessToken });
        const nextUser = {
          username: response.username,
          userId: response.userId,
          email: response.email,
        };
        setUser(nextUser);
        setStoredUser(nextUser);
        return nextUser;
      },
      logout() {
        clearStoredAuth();
        setToken('');
        setUser(null);
      },
      async refreshUser() {
        if (!token) return null;
        const response = await userApi.auth({ accessToken: token });
        const nextUser = {
          username: response.username,
          userId: response.userId,
          email: response.email,
        };
        setUser(nextUser);
        setStoredUser(nextUser);
        return nextUser;
      },
      updateUser(partialUser) {
        const nextUser = { ...(user ?? {}), ...(partialUser ?? {}) };
        setUser(nextUser);
        setStoredUser(nextUser);
      },
    }),
    [authLoading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
