import { SectionCard } from '../components/SectionCard';
import { ResultBox } from '../components/ResultBox';
import { config } from '../lib/config';

export function DashboardPage({ authToken, themeResult, themeError }) {
  return (
    <div className="page-grid">
      <SectionCard title="Projektübersicht" subtitle="Startseite mit Konfiguration und Schnellinfos.">
        <div className="stats-grid">
          <Stat label="User API" value={config.userApiBase} />
          <Stat label="Color API" value={config.colorApiBase} />
          <Stat label="Matchmaking WS" value={config.matchmakingWsUrl} />
          <Stat label="Skyjo API" value={config.skyjoApiBase} />
        </div>
      </SectionCard>

      <SectionCard title="Gespeicherter Access Token" subtitle="Wird für mehrere Bereiche wiederverwendet.">
        <ResultBox title="Token" value={authToken || 'Kein Token gespeichert'} />
      </SectionCard>

      <SectionCard title="Aktuelles GET /scheme Ergebnis" subtitle="Dieses Ergebnis bestimmt die UI-Farben beim Start.">
        <ResultBox value={themeResult} error={themeError} />
      </SectionCard>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <div className="eyebrow">{label}</div>
      <strong>{value}</strong>
    </div>
  );
}