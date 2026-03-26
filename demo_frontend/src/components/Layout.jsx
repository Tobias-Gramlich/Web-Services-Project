import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeScheme } from '../context/ThemeContext';

const navigation = [
  { to: '/', label: 'Login' },
  { to: '/register', label: 'Registrierung' },
  { to: '/send-email', label: 'E-Mail Versand' },
  { to: '/activate', label: 'Aktivierung' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/post-color-scheme', label: 'POST Color-Scheme' },
  { to: '/auth-check', label: 'Auth Check' },
  { to: '/change-username', label: 'Change Username' },
  { to: '/change-password', label: 'Change Password' },
  { to: '/matchmaking', label: 'Matchmaking' },
  { to: '/delete-account', label: 'Delete Account' },
];

export function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { themeStatus, theme } = useThemeScheme();

  return (
    <div className="app-shell">
      <aside className="sidebar card">
        <div>
          <p className="eyebrow">Web Services Project</p>
          <h1 className="sidebar-title">Frontend Control Center</h1>
          <p className="muted">
            Benutzerverwaltung, Color-Theme und Matchmaking in einer React-Oberfläche.
          </p>
        </div>

        <div className="theme-preview">
          <div className="color-swatch" style={{ background: theme.background }} />
          <div className="color-swatch" style={{ background: theme.surface }} />
          <div className="color-swatch" style={{ background: theme.primary_color }} />
          <div className="color-swatch" style={{ background: theme.secondary_color }} />
        </div>

        <div className="status-panel">
          <div>
            <span className="label">Theme</span>
            <strong>{themeStatus === 'ready' ? 'geladen' : 'Fallback aktiv'}</strong>
          </div>
          <div>
            <span className="label">Benutzer</span>
            <strong>{isAuthenticated ? user?.username : 'nicht eingeloggt'}</strong>
          </div>
        </div>

        <nav className="nav-grid">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="secondary-button" type="button" onClick={logout}>
          Logout & Token löschen
        </button>
      </aside>

      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
}