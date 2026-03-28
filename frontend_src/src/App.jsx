import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ActivatePage } from './pages/ActivatePage';
import { HomePage } from './pages/HomePage';
import { AccountSettingsPage } from './pages/AccountSettingsPage';
import { MatchmakingPage } from './pages/MatchmakingPage';
import { PrivateRoomPage } from './pages/PrivateRoomPage';
import { PrivateRoomWaitingPage } from './pages/PrivateRoomWaitingPage';
import { SkyjoPage } from './pages/SkyjoPage';
import { ColorPage } from './pages/ColorPage';
import { colorApi } from './lib/api';
import { normalizeColor } from './lib/utils';

const defaultThemeResult = {
  request: {
    source: 'fallback',
  },
  scheme: {
    background: '#f4f6f8',
    surface: '#ffffff',
    primary_color: '#90a4ae',
    secondary_color: '#b0bec5',
  },
};

function applyTheme(scheme) {
  if (!scheme) return;
  const root = document.documentElement;
  root.style.setProperty('--bg', normalizeColor(scheme.background));
  root.style.setProperty('--surface', normalizeColor(scheme.surface));
  root.style.setProperty('--primary', normalizeColor(scheme.primary_color));
  root.style.setProperty('--secondary', normalizeColor(scheme.secondary_color));
}

function ProtectedRoute({ authToken, children }) {
  if (!authToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const [themeResult, setThemeResult] = useState(defaultThemeResult);
  const [themeError, setThemeError] = useState('');
  const [isLoadingTheme, setIsLoadingTheme] = useState(true);
  const [authToken, setAuthToken] = useState(localStorage.getItem('accessToken') || '');
  const [activationUsername, setActivationUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const result = await colorApi.getScheme();
        if (!active) return;
        setThemeResult(result);
        applyTheme(result.scheme);
      } catch (error) {
        if (!active) return;
        const fallbackMessage = error.message || 'Theme konnte nicht geladen werden';
        setThemeError(`${fallbackMessage} — Default-Farbschema wird verwendet.`);
        setThemeResult(defaultThemeResult);
        applyTheme(defaultThemeResult.scheme);
      } finally {
        if (active) setIsLoadingTheme(false);
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('accessToken', authToken);
    } else {
      localStorage.removeItem('accessToken');
    }
  }, [authToken]);

  const sharedProps = useMemo(
    () => ({
      authToken,
      setAuthToken,
      activationUsername,
      setActivationUsername,
      themeResult,
      themeError,
      reloadTheme: async () => {
        try {
          const result = await colorApi.getScheme();
          setThemeResult(result);
          setThemeError('');
          applyTheme(result.scheme);
          return result;
        } catch (error) {
          const fallbackMessage = error.message || 'Theme konnte nicht geladen werden';
          setThemeError(`${fallbackMessage} — Default-Farbschema wird verwendet.`);
          setThemeResult(defaultThemeResult);
          applyTheme(defaultThemeResult.scheme);
          return defaultThemeResult;
        }
      },
      logout: () => {
        setAuthToken('');
        navigate('/login', { replace: true });
      },
    }),
    [authToken, activationUsername, themeResult, themeError, navigate]
  );

  if (isLoadingTheme) {
    return (
      <div className="boot-screen">
        <div className="card boot-card">
          <div className="spinner" />
          <h1>Lade UI-Farbschema …</h1>
          <p className="muted">Erst wird GET /scheme geladen, danach wird die App angezeigt.</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginPage
            authToken={authToken}
            setAuthToken={setAuthToken}
          />
        }
      />
      <Route
        path="/register"
        element={
          <RegisterPage
            setActivationUsername={setActivationUsername}
          />
        }
      />
      <Route
        path="/activate"
        element={
          <ActivatePage
            activationUsername={activationUsername}
          />
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute authToken={authToken}>
            <Layout>
              <HomePage {...sharedProps} />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute authToken={authToken}>
            <Layout>
              <AccountSettingsPage {...sharedProps} />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/matchmaking"
        element={
          <ProtectedRoute authToken={authToken}>
            <Layout>
              <MatchmakingPage {...sharedProps} />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/matchmaking/private-room"
        element={
          <ProtectedRoute authToken={authToken}>
            <Layout>
              <PrivateRoomPage {...sharedProps} />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/matchmaking/private-room-waiting"
        element={
          <ProtectedRoute authToken={authToken}>
            <Layout>
              <PrivateRoomWaitingPage {...sharedProps} />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/skyjo/:gameId"
        element={
          <ProtectedRoute authToken={authToken}>
            <Layout>
              <SkyjoPage {...sharedProps} />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/color"
        element={
          <ProtectedRoute authToken={authToken}>
            <Layout>
              <ColorPage {...sharedProps} />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={authToken ? '/' : '/login'} replace />} />
    </Routes>
  );
}