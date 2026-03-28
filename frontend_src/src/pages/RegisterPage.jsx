import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../lib/api';
import { ResultBox } from '../components/ResultBox';
import { SectionCard } from '../components/SectionCard';
import { FormRow } from '../components/FormRow';

export function RegisterPage({ setActivationUsername }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submitRegister() {
    setLoading(true);
    setError('');
    try {
      const data = await userApi.register(form);
      setResult(data);
      setActivationUsername(form.username);
      navigate('/activate', { replace: true });
    } catch (err) {
      setError(err.message || 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <SectionCard title="Registrierung" subtitle="Lege einen neuen Account an.">
        <FormRow>
          <input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </FormRow>
        <FormRow>
          <input
            placeholder="E-Mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </FormRow>
        <FormRow>
          <input
            type="password"
            placeholder="Passwort"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </FormRow>
        <div className="button-row">
          <button onClick={submitRegister} disabled={loading}>
            Registrieren
          </button>
          <button type="button" className="secondary-button" onClick={() => navigate('/login')}>
            Zurück zu Login
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Letzte Antwort">
        <ResultBox value={result} error={error} />
      </SectionCard>
    </div>
  );
}