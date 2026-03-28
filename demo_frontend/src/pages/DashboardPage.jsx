import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useThemeScheme } from '../context/ThemeContext';
import { fetchScheme } from '../lib/colorApi';
import { buildThemeFromScheme } from '../lib/theme';

export function DashboardPage() {
  const { user, token, isAuthenticated } = useAuth();
  const { theme, setTheme, setThemeStatus } = useThemeScheme();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState('');

  async function handleRefreshScheme() {
    setRefreshing(true);
    setRefreshError('');

    try {
      const response = await fetchScheme();
      const nextTheme = buildThemeFromScheme(response);
      setTheme(nextTheme);
      setThemeStatus('ready');
    } catch (error) {
      setRefreshError(error.message);
      setThemeStatus('fallback');
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="Dashboard"
        description="Zentrale Übersicht über den lokalen Login-Zustand, die geladenen Benutzerdaten und das automatisch geholte Color-Scheme."
        action={
          <button className="primary-button" type="button" onClick={handleRefreshScheme} disabled={refreshing}>
            {refreshing ? 'Lädt...' : 'GET /scheme neu laden'}
          </button>
        }
      />

      {refreshError ? (
        <section className="card">
          <div className="section-head">
            <h3>Fehler beim Neuladen</h3>
            <p className="muted">{refreshError}</p>
          </div>
        </section>
      ) : null}

      <section className="card stat-grid">
        <article className="stat-tile">
          <span className="label">Login Status</span>
          <strong>{isAuthenticated ? 'aktiv' : 'nicht aktiv'}</strong>
        </article>
        <article className="stat-tile">
          <span className="label">Username</span>
          <strong>{user?.username ?? '—'}</strong>
        </article>
        <article className="stat-tile">
          <span className="label">User-ID</span>
          <strong>{user?.userId ?? '—'}</strong>
        </article>
        <article className="stat-tile">
          <span className="label">E-Mail</span>
          <strong>{user?.email ?? '—'}</strong>
        </article>
      </section>

      <section className="card">
        <div className="section-head">
          <h3>Automatisch geladenes GET Color-Scheme</h3>
          <p className="muted">
            Dieses Theme wurde beim App-Start über `GET /scheme` geladen. Mit dem Button oben kannst du den Request
            sichtbar erneut ausführen.
          </p>
        </div>

        <div className="scheme-grid">
          <div className="scheme-card">
            <div className="scheme-box" style={{ background: theme.background }} />
            <span>background</span>
            <strong>{theme.background_hex}</strong>
            <code>{theme.background_raw}</code>
          </div>
          <div className="scheme-card">
            <div className="scheme-box" style={{ background: theme.surface }} />
            <span>surface</span>
            <strong>{theme.surface_hex}</strong>
            <code>{theme.surface_raw}</code>
          </div>
          <div className="scheme-card">
            <div className="scheme-box" style={{ background: theme.primary_color }} />
            <span>primary_color</span>
            <strong>{theme.primary_color_hex}</strong>
            <code>{theme.primary_color_raw}</code>
          </div>
          <div className="scheme-card">
            <div className="scheme-box" style={{ background: theme.secondary_color }} />
            <span>secondary_color</span>
            <strong>{theme.secondary_color_hex}</strong>
            <code>{theme.secondary_color_raw}</code>
          </div>
        </div>
      </section>

      <section className="card token-panel">
        <div className="section-head">
          <h3>GET-Request Grundlage</h3>
          <p className="muted">Damit siehst du direkt, welche Request-Kombination vom letzten geladenen Theme stammt.</p>
        </div>
        <code>{theme.request ? JSON.stringify(theme.request, null, 2) : 'Keine Request-Infos vorhanden.'}</code>
      </section>

      <section className="card token-panel">
        <div className="section-head">
          <h3>Lokal gespeichertes JWT</h3>
          <p className="muted">Zur besseren Kontrolle im Test-Setup wird das Token sichtbar angezeigt.</p>
        </div>
        <code>{token || 'Kein Token vorhanden.'}</code>
      </section>
    </div>
  );
}