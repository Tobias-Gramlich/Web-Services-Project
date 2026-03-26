import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FormCard } from '../components/FormCard';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';
import { useFormState } from '../hooks/useFormState';
import { userApi } from '../lib/userApi';

export function ActivatePage() {
  const { values, handleChange, reset } = useFormState({ username: '', activationcode: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await userApi.activate({
        username: values.username,
        activationcode: Number(values.activationcode),
      });
      setSuccess('Account aktiviert. Du kannst dich jetzt einloggen.');
      reset({ username: '', activationcode: '' });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="Aktivierung"
        description="POST /Users/activate. Aktiviert den Account mit dem erhaltenen Code."
      />
      <FormCard
        title="Account aktivieren"
        footer={<p className="muted">Danach weiter zum <Link to="/">Login</Link>.</p>}
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Username
            <input name="username" value={values.username} onChange={handleChange} placeholder="deinname" />
          </label>
          <label>
            Aktivierungscode
            <input name="activationcode" value={values.activationcode} onChange={handleChange} placeholder="123456" />
          </label>
          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? 'Wird aktiviert...' : 'Aktivieren'}
          </button>
        </form>
        <StatusMessage error={error} success={success} />
      </FormCard>
    </div>
  );
}
