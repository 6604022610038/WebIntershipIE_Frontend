function fmtDate(date) {
  if (!date) return "-";
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

/**
 * 🗺️ Internship Journey
 * แสดง Timeline เหตุการณ์ของการฝึกงานตั้งแต่เริ่มจนจบ
 */
export default function JourneyTimeline({ events = [], emptyText = "ยังไม่มีเหตุการณ์" }) {
  if (!events.length) {
    return <div className="journey-empty">{emptyText}</div>;
  }

  return (
    <div className="journey-timeline">
      {events.map((event, index) => (
        <div className={`journey-item journey-${event.status}`} key={index}>
          <div className="journey-line">
            <span className="journey-dot">{event.icon || "•"}</span>
            {index < events.length - 1 && <span className="journey-connector" />}
          </div>

          <div className="journey-content">
            <div className="journey-top">
              <strong>{event.title}</strong>
              <span className="journey-date">{fmtDate(event.date)}</span>
            </div>

            {event.detail && <p>{event.detail}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
