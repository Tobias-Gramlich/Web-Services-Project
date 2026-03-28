import { useState } from 'react';
import { SectionCard } from '../components/SectionCard';
import { ResultBox } from '../components/ResultBox';
import { FormRow } from '../components/FormRow';
import { colorApi } from '../lib/api';

export function ColorPage({ themeResult, reloadTheme }) {
  const [form, setForm] = useState({ time_of_day: 'Morning', day_type: 'Weekday', weather: 'Sunny' });
  const [result, setResult] = useState(themeResult);
  const [error, setError] = useState('');

  async function run(task) {
    setError('');
    try {
      const data = await task();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Unbekannter Fehler');
    }
  }

  return (
    <div className="page-grid">
      <SectionCard title="GET /scheme" subtitle="Lädt das aktuelle Farbschema und aktualisiert die App-Farben erneut.">
        <button onClick={() => run(reloadTheme)}>Theme neu laden</button>
      </SectionCard>

      <SectionCard title="POST /scheme" subtitle="Demo-Endpunkt für explizite Farbanfragen.">
        <FormRow>
          <select value={form.time_of_day} onChange={(e) => setForm({ ...form, time_of_day: e.target.value })}>
            <option>Morning</option>
            <option>Noon</option>
            <option>Evening</option>
            <option>Night</option>
          </select>
          <select value={form.day_type} onChange={(e) => setForm({ ...form, day_type: e.target.value })}>
            <option>Weekday</option>
            <option>Weekend</option>
          </select>
          <select value={form.weather} onChange={(e) => setForm({ ...form, weather: e.target.value })}>
            <option>Sunny</option>
            <option>Cloudy</option>
            <option>Rainy</option>
            <option>Snowy</option>
          </select>
        </FormRow>
        <button onClick={() => run(() => colorApi.postScheme(form))}>Demo-Schema anfragen</button>
      </SectionCard>

      <SectionCard title="Antwort">
        <ResultBox value={result} error={error} />
      </SectionCard>
    </div>
  );
}