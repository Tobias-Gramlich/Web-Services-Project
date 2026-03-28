import { useState } from 'react';
import { FormCard } from '../components/FormCard';
import { PageHeader } from '../components/PageHeader';
import { ProtectedNotice } from '../components/ProtectedNotice';
import { StatusMessage } from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../lib/userApi';

export function AuthCheckPage() {
  const { token, updateUser } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [response, setResponse] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCheck() {
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const authResponse = await userApi.auth({ accessToken: token });
      setResponse(authResponse);
      updateUser({ username: authResponse.username, userId: authResponse.userId, email: authResponse.email });
      setSuccess('Authentifizierung erfolgreich.');
    } catch (submitError) {
      setError(submitError.message);
      setResponse(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="Auth Check"
        description="POST /Users/auth. Nutzt das aktuell lokal gespeicherte JWT und zeigt die Response an."
      />
      <ProtectedNotice />
      <FormCard title="Token validieren" description="Das Formular sendet keinen neuen Input, sondern verwendet dein aktuelles JWT aus dem Local Storage.">
        <button className="primary-button" disabled={submitting || !token} onClick={handleCheck} type="button">
          {submitting ? 'Prüfung läuft...' : 'Auth-Endpunkt ausführen'}
        </button>
        <StatusMessage error={error} success={success} info={!token ? 'Kein lokales JWT gefunden.' : ''} />
        {response ? (
          <pre className="response-box">{JSON.stringify(response, null, 2)}</pre>
        ) : null}
      </FormCard>
    </div>
  );
}
