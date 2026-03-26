import { useState } from 'react';
import { FormCard } from '../components/FormCard';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';
import { useFormState } from '../hooks/useFormState';
import { userApi } from '../lib/userApi';

export function SendEmailPage() {
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
      await userApi.resendActivationMail(values);
      setSuccess('Aktivierungscode wurde erneut angefragt.');
      reset({ username: '', password: '' });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="E-Mail Versand"
        description="POST /Users/send_email. Fordert den Aktivierungscode erneut an."
      />
      <FormCard title="Aktivierungscode erneut senden">
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
            {submitting ? 'Wird angefragt...' : 'Code erneut senden'}
          </button>
        </form>
        <StatusMessage error={error} success={success} />
      </FormCard>
    </div>
  );
}
