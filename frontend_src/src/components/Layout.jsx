import { useLocation, useNavigate } from 'react-router-dom';

export function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';
  const isAccountPage = location.pathname === '/account';

  const showLeftHomeIcon = !isHomePage;
  const showRightAccountIcon = !isAccountPage;

  return (
    <div className="app-shell no-sidebar-layout">
      <header className="topbar">
        <div className="topbar-side topbar-left">
          {showLeftHomeIcon ? (
            <button
              type="button"
              className="icon-button"
              title="Zur Hauptseite"
              onClick={() => navigate('/')}
            >
              🏠
            </button>
          ) : (
            <div className="topbar-icon-placeholder" />
          )}
        </div>

        <div className="topbar-side topbar-right">
          {showRightAccountIcon ? (
            <button
              type="button"
              className="icon-button"
              title="Account Settings"
              onClick={() => navigate('/account')}
            >
              👤
            </button>
          ) : (
            <div className="topbar-icon-placeholder" />
          )}
        </div>
      </header>

      <main className="content content-full">{children}</main>
    </div>
  );
}