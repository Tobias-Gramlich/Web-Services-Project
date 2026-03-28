import { pretty } from '../lib/utils';

export function ResultBox({ title = 'Antwort', value, error }) {
  return (
    <div className={`result-box ${error ? 'error' : ''}`}>
      <div className="eyebrow">{error ? 'Fehler' : title}</div>
      <pre>{pretty(error || value)}</pre>
    </div>
  );
}