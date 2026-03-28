import { useState } from 'react';
import { FormCard } from '../components/FormCard';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';
import { useFormState } from '../hooks/useFormState';
import { postScheme } from '../lib/colorApi';
import { buildThemeFromScheme } from '../lib/theme';
import { useThemeScheme } from '../context/ThemeContext';

const INITIAL_VALUES = {
  time_of_day: 'Morning',
  day_type: 'Weekday',
  weather: 'Sunny',
};

export function PostColorSchemePage() {
  const { values, handleChange, reset } = useFormState(INITIAL_VALUES);
  const { setTheme, setThemeStatus } = useThemeScheme();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [responseJson, setResponseJson] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await postScheme(values);

      const wrappedResponse = {
        request: values,
        scheme: response,
      };

      const nextTheme = buildThemeFromScheme(wrappedResponse);
      setTheme(nextTheme);
      setThemeStatus('ready');

      setResponseJson(wrappedResponse);
      setSuccess('POST /scheme wurde erfolgreich ausgeführt und das Theme wurde direkt angewendet.');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="Color-Scheme Demo"
        description="POST /scheme mit frei wählbaren Demo-Werten. Das Ergebnis wird direkt als Theme angewendet."
      />

      <FormCard title="Color-Scheme manuell anfragen">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Time of day
            <select name="time_of_day" value={values.time_of_day} onChange={handleChange}>
              <option value="Morning">Morning</option>
              <option value="Midday">Midday</option>
              <option value="Night">Night</option>
            </select>
          </label>

          <label>
            Day type
            <select name="day_type" value={values.day_type} onChange={handleChange}>
              <option value="Weekday">Weekday</option>
              <option value="Friday">Friday</option>
              <option value="Weekend">Weekend</option>
            </select>
          </label>

          <label>
            Weather
            <select name="weather" value={values.weather} onChange={handleChange}>
              <option value="Sunny">Sunny</option>
              <option value="Rainy">Rainy</option>
              <option value="Storm">Storm</option>
              <option value="Snow">Snow</option>
              <option value="Cloudy">Cloudy</option>
            </select>
          </label>

          <div className="button-row wrap">
            <button className="primary-button" disabled={submitting} type="submit">
              {submitting ? 'Wird angefragt...' : 'POST /scheme ausführen'}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => reset(INITIAL_VALUES)}
              disabled={submitting}
            >
              Zurücksetzen
            </button>
          </div>
        </form>

        <StatusMessage error={error} success={success} />
      </FormCard>

      <section className="card token-panel">
        <div className="section-head">
          <h3>Antwort</h3>
          <p className="muted">Hier siehst du das zurückgegebene Color-Scheme aus dem POST-Request.</p>
        </div>
        <code>{responseJson ? JSON.stringify(responseJson, null, 2) : 'Noch kein POST /scheme ausgeführt.'}</code>
      </section>
    </div>
  );
}