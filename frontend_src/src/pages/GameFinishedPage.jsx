import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SectionCard } from '../components/SectionCard';

export function GameFinishedPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const finishedPayload = useMemo(() => {
    if (location.state?.standings?.length) return location.state;

    try {
      const raw = localStorage.getItem('skyjoFinishedGame');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [location.state]);

  const standings = finishedPayload?.standings || [];

  function handleBackToMatchmaking() {
    localStorage.removeItem('skyjoFinishedGame');
    navigate('/matchmaking', { replace: true });
  }

  return (
    <div className="page-grid game-finished-page">
      <SectionCard
        title="Spiel beendet"
        subtitle="Das Skyjo-Spiel ist abgeschlossen. Die Platzierungen richten sich nach den niedrigsten Gesamtpunkten."
      >
        <div className="game-finished-hero stat-card">
          <div className="eyebrow">Finale Wertung</div>
          <strong>
            {finishedPayload?.gameId ? `Spiel #${finishedPayload.gameId}` : 'Skyjo'}
            {finishedPayload?.round ? ` · Runde ${finishedPayload.round}` : ''}
          </strong>
        </div>

        <div className="game-finished-standings">
          {standings.length === 0 ? (
            <div className="stat-card">
              <strong>Keine Platzierungen verfügbar</strong>
              <p className="muted small">Lade das Spiel erneut oder gehe zurück zum Matchmaking.</p>
            </div>
          ) : (
            standings.map((entry) => (
              <div
                key={`${entry.playerId}-${entry.rank}`}
                className={[
                  'game-finished-row',
                  entry.rank === 1 ? 'winner' : '',
                  entry.isMe ? 'self' : '',
                ].filter(Boolean).join(' ')}
              >
                <div className="game-finished-rank">#{entry.rank}</div>
                <div className="game-finished-player">
                  <strong>Spieler {entry.playerId}</strong>
                  <span className="muted small">{entry.isMe ? 'Du' : 'Mitspieler'}</span>
                </div>
                <div className="game-finished-points">{entry.points} Punkte</div>
              </div>
            ))
          )}
        </div>

        <div className="home-actions">
          <button onClick={handleBackToMatchmaking}>Zurück zu Matchmaking</button>
        </div>
      </SectionCard>
    </div>
  );
}