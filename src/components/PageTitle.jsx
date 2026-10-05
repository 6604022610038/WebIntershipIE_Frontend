export default function PageTitle({
  title,
  subtitle,
  action,
}) {
  return (
    <div className="page-title">

      <div>
        <h1>{title}</h1>

        <p>{subtitle}</p>
      </div>

      {action}

    </div>
  );
}