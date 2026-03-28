export function StatusMessage({ error, success, info }) {
  if (!error && !success && !info) return null;

  return (
    <div className="status-stack">
      {error ? <div className="alert error">{error}</div> : null}
      {success ? <div className="alert success">{success}</div> : null}
      {info ? <div className="alert info">{info}</div> : null}
    </div>
  );
}
