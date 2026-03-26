import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FormCard } from '../components/FormCard';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';
import { useFormState } from '../hooks/useFormState';
import { userApi } from '../lib/userApi';

export function RegisterPage() {
  const { values, handleChange, reset } = useFormState({ username: '', password: '', email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await userApi.register(values);
      setSuccess('Registrierung erfolgreich. Der Account ist noch nicht aktiviert; du solltest nun den Aktivierungscode per E-Mail erhalten.');
      reset({ username: '', password: '', email: '' });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="Registrierung"
        description="POST /Users/register. Erzeugt den Benutzer, sendet aber noch kein Login zurück."
      />

      <FormCard
        title="Neuen Benutzer anlegen"
        description="Passwort und E-Mail werden wie im Backend validiert. Danach kannst du zur Aktivierung oder zum erneuten E-Mail-Versand weitergehen."
        footer={<p className="muted"><Link to="/send-email">Aktivierungscode erneut senden</Link> oder <Link to="/activate">Account aktivieren</Link></p>}
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
          <label>
            E-Mail
            <input type="email" name="email" value={values.email} onChange={handleChange} placeholder="name@example.com" />
          </label>
          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? 'Registrierung läuft...' : 'Registrieren'}
          </button>
        </form>
        <StatusMessage error={error} success={success} />
      </FormCard>
    </div>
  );
}
