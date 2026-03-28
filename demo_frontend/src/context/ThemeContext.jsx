import { createContext, useContext, useMemo, useState } from 'react';
import { applyThemeToDocument, getFallbackTheme } from '../lib/theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children, initialTheme, initialThemeStatus = 'ready' }) {
  const [theme, setThemeState] = useState(initialTheme ?? getFallbackTheme());
  const [themeStatus, setThemeStatus] = useState(initialThemeStatus);

  const value = useMemo(
    () => ({
      theme,
      themeStatus,
      setTheme(nextTheme) {
        setThemeState(nextTheme);
        applyThemeToDocument(nextTheme);
      },
      setThemeStatus,
    }),
    [theme, themeStatus]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeScheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeScheme must be used inside ThemeProvider');
  }
  return context;
}