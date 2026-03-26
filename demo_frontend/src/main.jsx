import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { fetchScheme } from './lib/colorApi';
import { setStoredTheme } from './lib/storage';
import { applyThemeToDocument, buildThemeFromScheme, getFallbackTheme } from './lib/theme';
import './styles.css';

async function resolveInitialTheme() {
  try {
    const response = await fetchScheme();
    const theme = buildThemeFromScheme(response);
    setStoredTheme(theme);
    applyThemeToDocument(theme);
    return { theme, status: 'ready' };
  } catch (error) {
    console.error('Initial theme fetch failed:', error);

    const fallbackTheme = getFallbackTheme();
    applyThemeToDocument(fallbackTheme);
    return {
      theme: fallbackTheme,
      status: 'fallback',
    };
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));

resolveInitialTheme().then(({ theme, status }) => {
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider initialTheme={theme} initialThemeStatus={status}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
});