export function SectionCard({ title, subtitle, children, actions }) {
  return (
    <section className="card section-card">
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className="muted">{subtitle}</p> : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}