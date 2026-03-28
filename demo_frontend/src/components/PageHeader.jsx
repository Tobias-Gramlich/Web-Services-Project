export function PageHeader({ title, description, action }) {
  return (
    <div className="page-header card">
      <div>
        <p className="eyebrow">Endpoint View</p>
        <h2>{title}</h2>
        <p className="muted">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
