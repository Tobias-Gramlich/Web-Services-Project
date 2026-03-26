import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormCard } from '../components/FormCard';
import { PageHeader } from '../components/PageHeader';
import { ProtectedNotice } from '../components/ProtectedNotice';
import { StatusMessage } from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../lib/userApi';

export function DeleteAccountPage() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleDelete() {
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await userApi.deleteAccount({ accessToken: token });
      logout();
      setSuccess('Account gelöscht.');
      navigate('/register');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="Delete Account"
        description="DELETE /Users/delete_Account. Führt den Löschvorgang mit dem gespeicherten JWT aus."
      />
      <ProtectedNotice />
      <FormCard title="Account dauerhaft löschen" description="Die Aktion sendet sofort den Delete-Request an das Backend.">
        <button className="danger-button" disabled={submitting || !token} onClick={handleDelete} type="button">
          {submitting ? 'Wird gelöscht...' : 'Account löschen'}
        </button>
        <StatusMessage error={error} success={success} info={!token ? 'Kein lokales JWT gefunden.' : ''} />
      </FormCard>
    </div>
  );
}
