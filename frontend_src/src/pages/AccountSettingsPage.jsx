import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionCard } from '../components/SectionCard';
import { ResultBox } from '../components/ResultBox';
import { userApi } from '../lib/api';

export function AccountSettingsPage({ authToken, setAuthToken, logout }) {
  const navigate = useNavigate();
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loadingKey, setLoadingKey] = useState('');

  async function run(key, task) {
    setLoadingKey(key);
    setError('');
    try {
      const data = await task();
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message || 'Unbekannter Fehler');
    } finally {
      setLoadingKey('');
    }
  }

  return (
    <div className="page-grid">
      <SectionCard title="Username ändern" subtitle="PUT /Users/change_Username">
        <input
          placeholder="Neuer Username"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          onClick={() =>
            run('changeName', () =>
              userApi.changeUsername({ accessToken: authToken, newName })
            )
          }
          disabled={loadingKey === 'changeName'}
        >
          Username ändern
        </button>
      </SectionCard>

      <SectionCard title="Passwort ändern" subtitle="PUT /Users/change_Password">
        <input
          type="password"
          placeholder="Neues Passwort"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button
          onClick={() =>
            run('changePassword', () =>
              userApi.changePassword({ accessToken: authToken, newPassword })
            )
          }
          disabled={loadingKey === 'changePassword'}
        >
          Passwort ändern
        </button>
      </SectionCard>

      <SectionCard title="Account löschen" subtitle="DELETE /Users/delete_Account">
        <button
          className="danger"
          onClick={async () => {
            const confirmed = window.confirm('Möchtest du deinen Account wirklich löschen?');
            if (!confirmed) return;

            const data = await run('deleteAccount', () =>
              userApi.deleteAccount({ accessToken: authToken })
            );

            if (data) {
              setAuthToken('');
              navigate('/login', { replace: true });
            }
          }}
          disabled={loadingKey === 'deleteAccount'}
        >
          Account löschen
        </button>
      </SectionCard>

      <SectionCard title="Logout" subtitle="Meldet dich ab und bringt dich zurück zur Login-Seite.">
        <button className="secondary-button" onClick={logout}>
          Logout
        </button>
      </SectionCard>

      <SectionCard title="Letzte Antwort">
        <ResultBox value={result} error={error} />
      </SectionCard>
    </div>
  );
}