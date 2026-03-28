import { useNavigate } from 'react-router-dom';
import { SectionCard } from '../components/SectionCard';

export function HomePage({ logout }) {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <SectionCard
        title="Hauptseite"
        subtitle="Von hier aus erreichst du Matchmaking und Skyjo-Logik."
      >
        <div className="home-card-content">
          <div className="home-hero">
            <h2>Willkommen im Web Services Project Frontend</h2>
            <p className="muted">
              Wähle einen Bereich aus, um mit Matchmaking oder der Skyjo-Logik zu arbeiten.
            </p>
          </div>

          <div className="home-actions">
            <button onClick={() => navigate('/matchmaking')}>Zu Matchmaking</button>
            <button onClick={() => navigate('/skyjo')}>Zu Skyjo</button>
            <button className="secondary-button" onClick={logout}>Logout</button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}