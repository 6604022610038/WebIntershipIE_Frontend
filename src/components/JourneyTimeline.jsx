import { useMemo, useState } from "react";

/* ---------- helpers ---------- */
const DAY = 24 * 60 * 60 * 1000;

function toDate(v) {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function fmtDate(date) {
  const d = toDate(date);
  if (!d) return "-";
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}

function fmtMonth(date) {
  return toDate(date).toLocaleDateString("th-TH", { month: "long", year: "numeric" });
}

function relDay(date, todayMs) {
  const diff = Math.round((startOfDay(toDate(date)) - todayMs) / DAY);
  if (diff === 0) return "วันนี้";
  if (diff === 1) return "พรุ่งนี้";
  if (diff === -1) return "เมื่อวาน";
  if (diff > 0) return diff < 60 ? `อีก ${diff} วัน` : `อีก ${Math.round(diff / 30)} เดือน`;
  return -diff < 60 ? `${-diff} วันที่แล้ว` : `${Math.round(-diff / 30)} เดือนที่แล้ว`;
}

const TYPE_META = {
  "weekly-report": { label: "รายงาน", cls: "report" },
  evaluation: { label: "ประเมิน", cls: "eval" },
  activity: { label: "นัดหมาย", cls: "activity" },
  milestone: { label: "หมุดหมาย", cls: "milestone" },
};

const STATUS_META = {
  done: { label: "เสร็จแล้ว" },
  warning: { label: "ต้องแก้ไข" },
  pending: { label: "รอดำเนินการ" },
  future: { label: "กำหนดการ" },
};

const FILTERS = [
  { key: "all", label: "ทั้งหมด", test: () => true },
  { key: "weekly-report", label: "📘 รายงาน", test: (e) => e.type === "weekly-report" },
  { key: "evaluation", label: "⭐ ประเมิน", test: (e) => e.type === "evaluation" },
  { key: "activity", label: "📅 นัดหมาย", test: (e) => e.type === "activity" },
  { key: "warning", label: "⚠️ ต้องแก้ไข", test: (e) => e.status === "warning" },
];

const KEEP_PAST = 5; // จำนวนเหตุการณ์ในอดีตที่แสดงเมื่อพับรายการ

/**
 * 🗺️ Internship Journey
 * Timeline เหตุการณ์ฝึกงาน: สรุปภาพรวม • ตัวกรอง • จัดกลุ่มตามเดือน • เส้น "วันนี้" • พับรายการเก่า
 */
export default function JourneyTimeline({ events = [], emptyText = "ยังไม่มีเหตุการณ์", compact = false }) {
  const [filter, setFilter] = useState("all");
  const [newestFirst, setNewestFirst] = useState(false);
  const [showAllPast, setShowAllPast] = useState(false);
  const [openIdx, setOpenIdx] = useState(null);

  const todayMs = startOfDay(new Date());

  // เตรียมข้อมูล: เรียงตามเวลา + ระบุว่าเป็นอดีต/อนาคต
  const items = useMemo(
    () =>
      events
        .map((e, i) => ({ ...e, _id: i, _date: toDate(e.date) }))
        .filter((e) => e._date)
        .sort((a, b) => a._date - b._date)
        .map((e) => ({ ...e, _future: startOfDay(e._date) > todayMs })),
    [events, todayMs]
  );

  const stats = useMemo(() => {
    const first = items.find((e) => e.type === "milestone" && e.icon === "🚀") || items[0];
    const last = [...items].reverse().find((e) => e.type === "milestone" && e.icon !== "🚀");
    let progress = null;
    if (first && last && last._date > first._date) {
      progress = Math.max(0, Math.min(100, Math.round(((Date.now() - first._date) / (last._date - first._date)) * 100)));
    }
    return {
      total: items.length,
      done: items.filter((e) => e.status === "done").length,
      warning: items.filter((e) => e.status === "warning").length,
      upcoming: items.filter((e) => e._future).length,
      next: items.find((e) => e._future),
      progress,
      endDate: last?._date,
    };
  }, [items]);

  if (!items.length) {
    return <div className="journey-empty">{emptyText}</div>;
  }

  const active = FILTERS.find((f) => f.key === filter) || FILTERS[0];
  const filtered = items.filter(active.test);
  const past = filtered.filter((e) => !e._future);
  const future = filtered.filter((e) => e._future);

  const canFold = filter === "all" && past.length > KEEP_PAST + 1;
  const hiddenCount = canFold && !showAllPast ? past.length - KEEP_PAST : 0;
  const visiblePast = hiddenCount ? past.slice(-KEEP_PAST) : past;

  // ลำดับแสดงผล (เก่า→ใหม่) แล้วค่อยกลับด้านถ้าเลือก "ล่าสุดก่อน"
  let rows = [
    ...(hiddenCount ? [{ kind: "fold" }] : []),
    ...visiblePast.map((e) => ({ kind: "event", e })),
    { kind: "today" },
    ...future.map((e) => ({ kind: "event", e })),
  ];
  if (newestFirst) rows = rows.reverse();

  // ใส่หัวเดือนคั่น (ตามลำดับที่แสดง)
  const out = [];
  let lastMonth = null;
  rows.forEach((r) => {
    if (r.kind === "event") {
      const m = fmtMonth(r.e._date);
      if (m !== lastMonth) {
        out.push({ kind: "month", label: m });
        lastMonth = m;
      }
    }
    out.push(r);
  });

  const counts = Object.fromEntries(FILTERS.map((f) => [f.key, items.filter(f.test).length]));
  const visibleDots = out.filter((r) => r.kind !== "month");

  return (
    <div className={`journey-wrap ${compact ? "journey-compact" : ""}`}>
      {/* ---------- สรุปภาพรวม ---------- */}
      <div className="journey-summary">
        <div className="journey-stat">
          <b>{stats.done}</b>
          <span>เสร็จแล้ว</span>
        </div>
        <div className={`journey-stat ${stats.warning ? "is-warn" : ""}`}>
          <b>{stats.warning}</b>
          <span>ต้องแก้ไข</span>
        </div>
        <div className="journey-stat">
          <b>{stats.upcoming}</b>
          <span>กำลังจะถึง</span>
        </div>
        {stats.progress !== null && (
          <div className="journey-progress" title={`สิ้นสุด ${fmtDate(stats.endDate)}`}>
            <div className="journey-progress-top">
              <span>ระยะเวลาฝึกงาน</span>
              <b>{stats.progress}%</b>
            </div>
            <div className="journey-progress-bar">
              <i style={{ width: `${stats.progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {stats.next && (
        <div className="journey-next">
          <span className="journey-next-label">ถัดไป</span>
          <strong>
            {stats.next.icon} {stats.next.title}
          </strong>
          <span className="journey-next-when">
            {fmtDate(stats.next._date)} · {relDay(stats.next._date, todayMs)}
          </span>
        </div>
      )}

      {/* ---------- ตัวกรอง ---------- */}
      <div className="journey-toolbar">
        <div className="journey-filters">
          {FILTERS.filter((f) => f.key === "all" || counts[f.key] > 0).map((f) => (
            <button
              key={f.key}
              type="button"
              className={`journey-chip ${filter === f.key ? "active" : ""}`}
              onClick={() => {
                setFilter(f.key);
                setOpenIdx(null);
              }}
            >
              {f.label}
              <em>{counts[f.key]}</em>
            </button>
          ))}
        </div>
        <button type="button" className="journey-sort" onClick={() => setNewestFirst((v) => !v)}>
          {newestFirst ? "↓ ล่าสุดก่อน" : "↑ เก่าสุดก่อน"}
        </button>
      </div>

      {!filtered.length && <div className="journey-empty">ไม่พบเหตุการณ์ในหมวดนี้</div>}

      {/* ---------- Timeline ---------- */}
      <div className="journey-timeline">
        {out.map((r, i) => {
          if (r.kind === "month") {
            return (
              <div className="journey-month" key={`m-${i}`}>
                <span>{r.label}</span>
              </div>
            );
          }

          if (r.kind === "today") {
            return (
              <div className="journey-today" key={`t-${i}`}>
                <span className="journey-today-pill">
                  วันนี้ · {fmtDate(new Date())}
                </span>
              </div>
            );
          }

          if (r.kind === "fold") {
            return (
              <button type="button" className="journey-fold" key={`f-${i}`} onClick={() => setShowAllPast(true)}>
                ▾ แสดงเหตุการณ์ก่อนหน้าอีก {hiddenCount} รายการ
              </button>
            );
          }

          const e = r.e;
          const idx = visibleDots.indexOf(r);
          const isLast = idx === visibleDots.length - 1;
          const meta = TYPE_META[e.type] || { label: "", cls: "other" };
          const st = STATUS_META[e.status];
          const isReport = e.type === "weekly-report";
          const statusText = isReport && e.detail ? e.detail : st?.label;
          const detailText = isReport ? "" : e.detail;
          const long = (detailText || "").length > 90;
          const open = openIdx === e._id;

          return (
            <div
              className={`journey-item journey-${e.status} jt-${meta.cls} ${e._future ? "is-future" : ""}`}
              key={`e-${e._id}`}
            >
              <div className="journey-line">
                <span className="journey-dot">{e.icon || "•"}</span>
                {!isLast && <span className="journey-connector" />}
              </div>

              <div className="journey-content">
                <div className="journey-top">
                  <strong>{e.title}</strong>
                  <span className="journey-date">
                    {fmtDate(e._date)}
                    <small>{relDay(e._date, todayMs)}</small>
                  </span>
                </div>

                <div className="journey-tags">
                  {meta.label && <span className={`journey-tag tag-${meta.cls}`}>{meta.label}</span>}
                  {statusText && <span className={`journey-tag st-${e.status}`}>{statusText}</span>}
                </div>

                {detailText && <p className={long && !open ? "clamp" : ""}>{detailText}</p>}
                {long && (
                  <button type="button" className="journey-more" onClick={() => setOpenIdx(open ? null : e._id)}>
                    {open ? "ย่อ" : "อ่านเพิ่ม"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {canFold && showAllPast && (
        <button type="button" className="journey-fold" onClick={() => setShowAllPast(false)}>
          ▴ พับเหตุการณ์เก่า
        </button>
      )}
    </div>
  );
}
