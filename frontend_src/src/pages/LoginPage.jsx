import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../lib/api';
import { ResultBox } from '../components/ResultBox';
import { SectionCard } from '../components/SectionCard';
import { FormRow } from '../components/FormRow';

export function LoginPage({ setAuthToken }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submitLogin() {
    setLoading(true);
    setError('');
    try {
      const data = await userApi.login(form);
      setResult(data);
      if (data?.accessToken) {
        setAuthToken(data.accessToken);
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <SectionCard title="Login" subtitle="Melde dich an, um zur Hauptseite zu gelangen.">
        <FormRow>
          <input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
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
          <button onClick={submitLogin} disabled={loading}>
            Anmelden
          </button>
          <button type="button" className="secondary-button" onClick={() => navigate('/register')}>
            Registrieren
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Letzte Antwort">
        <ResultBox value={result} error={error} />
      </SectionCard>
    </div>
  );
}