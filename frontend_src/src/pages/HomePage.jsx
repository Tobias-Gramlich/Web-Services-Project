import { useNavigate } from 'react-router-dom';
import { SectionCard } from '../components/SectionCard';
import { SkyjoHero } from '../components/SkyjoHero';

export function HomePage({ logout, themeResult }) {
  const navigate = useNavigate();

  const colorScheme = themeResult?.scheme
    ? {
        background: themeResult.scheme.background,
        surface:    themeResult.scheme.surface,
        primary:    themeResult.scheme.primary_color,
        secondary:  themeResult.scheme.secondary_color,
      }
    : undefined;

  return (
    <div className="home-page">
      <SectionCard title="Hauptseite">
        <div className="home-card-content">
          <div className="home-hero">
            <SkyjoHero colorScheme={colorScheme} />
            <p className="muted">
              Wähle Matchmaking aus und spiele Skyjo mit deinen Freunden.
            </p>
          </div>
          <div className="home-actions">
            <button onClick={() => navigate('/matchmaking')}>Zu Matchmaking</button>
            <button className="secondary-button" onClick={logout}>Logout</button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}