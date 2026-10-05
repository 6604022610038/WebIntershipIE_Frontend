export default function Card({
  title,
  action,
  children,
  className = "",
}) {
  return (
    <section
      className={`card ${className}`}
    >
      <div className="card-title">
        <h3>{title}</h3>

        {action}
      </div>

      {children}
    </section>
  );
}