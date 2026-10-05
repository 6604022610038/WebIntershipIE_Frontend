export default function Modal({
  title,
  icon = "📝",
  onClose,
  children,
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="modal-head">
          <div className="modal-head-title">
            <span className="modal-head-icon">{icon}</span>
            <h3>{title}</h3>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {children}

      </div>
    </div>
  );
}