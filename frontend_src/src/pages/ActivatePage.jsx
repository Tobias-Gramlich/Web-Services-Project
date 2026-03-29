import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../lib/api';
import { ResultBox } from '../components/ResultBox';
import { SectionCard } from '../components/SectionCard';
import { FormRow } from '../components/FormRow';

export function ActivatePage({ activationUsername, activationCode, setActivationCode }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: activationUsername || '',
    activationcode: activationCode || '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loadingKey, setLoadingKey] = useState('');

  useEffect(() => {
    setForm((current) => ({
      ...current,
      username: activationUsername || current.username,
      activationcode: activationCode || current.activationcode,
    }));
  }, [activationUsername, activationCode]);

  async function submitActivate() {
    setLoadingKey('activate');
    setError('');
    try {
      const data = await userApi.activate({
        username: form.username,
        activationcode: Number(form.activationcode),
      });
      setResult(data);
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message || 'Aktivierung fehlgeschlagen');
    } finally {
      setLoadingKey('');
    }
  }

  async function requestNewCode() {
    const username = window.prompt('Bitte Username eingeben:', form.username || '');
    if (username === null) return;

    const password = window.prompt('Bitte Passwort eingeben:');
    if (password === null) return;

    setLoadingKey('sendEmail');
    setError('');
    try {
      const data = await userApi.sendEmail({ username, password });
      setResult(data);

      const nextCode = String(data?.activationcode ?? '');
      setActivationCode(nextCode);
      setForm((current) => ({
        ...current,
        username,
        activationcode: nextCode,
      }));
    } catch (err) {
      setError(err.message || 'Neuer Aktivierungscode konnte nicht angefordert werden');
    } finally {
      setLoadingKey('');
    }
  }

  return (
    <div className="auth-shell">
      <SectionCard title="Account aktivieren" subtitle="Der Aktivierungscode wird direkt angezeigt. Nutze ihn, um deinen Account freizuschalten.">
        <div className="stat-card">
          <div className="eyebrow">Aktueller Aktivierungscode</div>
          <strong>{activationCode || form.activationcode || 'Noch kein Code vorhanden'}</strong>
          <p className="muted small">
            Nach Klick auf den Button wird ein neuer Code angefordert und die Anzeige sofort aktualisiert.
          </p>
        </div>

        <FormRow>
          <input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </FormRow>
        <FormRow>
          <input
            placeholder="Activation Code"
            value={form.activationcode}
            onChange={(e) => setForm({ ...form, activationcode: e.target.value })}
          />
        </FormRow>
        <div className="button-row">
          <button onClick={submitActivate} disabled={loadingKey === 'activate'}>
            Aktivieren
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={requestNewCode}
            disabled={loadingKey === 'sendEmail'}
          >
            Neuen Aktivierungscode holen
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Letzte Antwort">
        <ResultBox value={result} error={error} />
      </SectionCard>
    </div>
  );
}