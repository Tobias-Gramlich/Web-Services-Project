import { useState } from 'react';
import { FormCard } from '../components/FormCard';
import { PageHeader } from '../components/PageHeader';
import { ProtectedNotice } from '../components/ProtectedNotice';
import { StatusMessage } from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';
import { useFormState } from '../hooks/useFormState';
import { userApi } from '../lib/userApi';

export function ChangePasswordPage() {
  const { token } = useAuth();
  const { values, handleChange, reset } = useFormState({ newPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await userApi.changePassword({ accessToken: token, newPassword: values.newPassword });
      setSuccess('Passwort erfolgreich geändert.');
      reset({ newPassword: '' });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="Change Password"
        description="PUT /Users/change_Password. Nutzt das lokal gespeicherte JWT."
      />
      <ProtectedNotice />
      <FormCard title="Passwort ändern">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Neues Passwort
            <input type="password" name="newPassword" value={values.newPassword} onChange={handleChange} placeholder="••••••••" />
          </label>
          <button className="primary-button" disabled={submitting || !token} type="submit">
            {submitting ? 'Wird gespeichert...' : 'Passwort ändern'}
          </button>
        </form>
        <StatusMessage error={error} success={success} info={!token ? 'Kein lokales JWT gefunden.' : ''} />
      </FormCard>
    </div>
  );
}
