import "./components.css";

export default function Empty({
  text = "ไม่มีข้อมูล",
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        🗂
      </div>

      <p>{text}</p>
    </div>
  );
}