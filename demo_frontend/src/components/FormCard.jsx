export function FormCard({ title, description, footer, children }) {
  return (
    <section className="card form-card">
      <div>
        <h3>{title}</h3>
        {description ? <p className="muted">{description}</p> : null}
      </div>
      {children}
      {footer ? <div>{footer}</div> : null}
    </section>
  );
}

export default FormCard;