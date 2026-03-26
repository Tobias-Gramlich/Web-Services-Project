import { useState } from 'react';
import { FormCard } from '../components/FormCard';
import { PageHeader } from '../components/PageHeader';
import { ProtectedNotice } from '../components/ProtectedNotice';
import { StatusMessage } from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';
import { useFormState } from '../hooks/useFormState';
import { userApi } from '../lib/userApi';

export function ChangeUsernamePage() {
  const { token, updateUser, refreshUser } = useAuth();
  const { values, handleChange, reset } = useFormState({ newName: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await userApi.changeUsername({ accessToken: token, newName: values.newName });
      updateUser({ username: values.newName });
      try {
        await refreshUser();
      } catch {
        // Some backends keep the old JWT payload. Keep optimistic UI update.
      }
      setSuccess('Benutzername erfolgreich geändert.');
      reset({ newName: '' });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="Change Username"
        description="PUT /Users/change_Username. Verwendet das aktuell lokal gespeicherte JWT."
      />
      <ProtectedNotice />
      <FormCard title="Benutzernamen ändern">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Neuer Benutzername
            <input name="newName" value={values.newName} onChange={handleChange} placeholder="neuer_name" />
          </label>
          <button className="primary-button" disabled={submitting || !token} type="submit">
            {submitting ? 'Wird gespeichert...' : 'Benutzernamen ändern'}
          </button>
        </form>
        <StatusMessage error={error} success={success} info={!token ? 'Kein lokales JWT gefunden.' : ''} />
      </FormCard>
    </div>
  );
}
