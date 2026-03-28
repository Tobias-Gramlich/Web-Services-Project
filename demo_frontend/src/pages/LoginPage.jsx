import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FormCard } from '../components/FormCard';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';
import { useFormState } from '../hooks/useFormState';
import { userApi } from '../lib/userApi';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { values, handleChange, reset } = useFormState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await userApi.login(values);
      await login(response.accessToken);
      setSuccess('Login erfolgreich. Dein JWT wurde lokal gespeichert.');
      reset({ username: '', password: '' });
      navigate('/dashboard');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="Login"
        description="POST /Users/login bzw. /users/login. Erfolgreiche Tokens werden automatisch lokal gespeichert."
      />

      <FormCard
        title="Benutzer anmelden"
        description="Nach dem Login wird direkt der Auth-Endpunkt abgefragt, damit Username, E-Mail und User-ID im Frontend verfügbar sind."
        footer={<p className="muted">Noch keinen Account? <Link to="/register">Zur Registrierung</Link></p>}
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Username
            <input name="username" value={values.username} onChange={handleChange} placeholder="deinname" />
          </label>
          <label>
            Passwort
            <input type="password" name="password" value={values.password} onChange={handleChange} placeholder="••••••••" />
          </label>
          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? 'Login läuft...' : 'Einloggen'}
          </button>
        </form>
        <StatusMessage error={error} success={success} />
      </FormCard>
    </div>
  );
}
