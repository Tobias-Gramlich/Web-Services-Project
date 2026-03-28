import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../lib/api';
import { ResultBox } from '../components/ResultBox';
import { SectionCard } from '../components/SectionCard';
import { FormRow } from '../components/FormRow';

export function ActivatePage({ activationUsername }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: activationUsername || '',
    activationcode: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loadingKey, setLoadingKey] = useState('');

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

  async function resendEmail() {
    const username = window.prompt('Bitte Username eingeben:', form.username || '');
    if (username === null) return;

    const password = window.prompt('Bitte Passwort eingeben:');
    if (password === null) return;

    setLoadingKey('sendEmail');
    setError('');
    try {
      const data = await userApi.sendEmail({ username, password });
      setResult(data);
      setForm((current) => ({ ...current, username }));
    } catch (err) {
      setError(err.message || 'Senden der Aktivierungsmail fehlgeschlagen');
    } finally {
      setLoadingKey('');
    }
  }

  return (
    <div className="auth-shell">
      <SectionCard title="Account aktivieren" subtitle="Du bleibst auf dieser Seite, bis die Aktivierung erfolgreich abgesendet wurde.">
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
            onClick={resendEmail}
            disabled={loadingKey === 'sendEmail'}
          >
            send_email
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Letzte Antwort">
        <ResultBox value={result} error={error} />
      </SectionCard>
    </div>
  );
}