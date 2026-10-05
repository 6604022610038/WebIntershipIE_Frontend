import { useMemo, useState } from "react";

import "./student.css";
import "./dashboard.css";

/* ---------------------------------------------------------
   ตัวช่วย: วันที่ / ข้อความภาษาไทย
   --------------------------------------------------------- */

const DAY_MS = 86400000;

const QUOTES = [
  "งานเล็ก ๆ ที่ทำต่อเนื่องทุกวัน สร้างผลลัพธ์ใหญ่ได้เสมอ",
  "ไม่เข้าใจไม่เป็นไร ถามพี่เลี้ยงเร็ว ๆ ดีกว่าเดาไปนาน ๆ",
  "บันทึกรายงานวันนี้ ประหยัดเวลานึกย้อนวันหลัง",
  "ทุกบั๊กที่แก้เองได้ คือความรู้ที่ติดตัวไปตลอด",
  "ผลลัพธ์ที่วัดเป็นตัวเลขได้ ทำให้รายงานน่าเชื่อถือขึ้นมาก",
  "ทำงานให้เสร็จก่อน แล้วค่อยขัดเกลาให้ดี",
  "การฟังฟีดแบ็กอย่างเปิดใจ คือทางลัดของการเติบโต",
  "พักสายตาสักนิด แล้วกลับมาเขียนโค้ดหรืองานเอกสารต่อจะคมกว่าเดิม",
];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function toDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function ymd(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function thShort(d) {
  const x = toDate(d);
  return x
    ? x.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })
    : "-";
}

function thDay(d) {
  const x = toDate(d);
  return x
    ? x.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long" })
    : "-";
}

function greeting(hour) {
  if (hour < 5) return "ดึกแล้วนะ";
  if (hour < 12) return "อรุณสวัสดิ์";
  if (hour < 17) return "สวัสดีตอนบ่าย";
  if (hour < 20) return "สวัสดีตอนเย็น";
  return "สวัสดีตอนค่ำ";
}

function firstName(full = "") {
  const parts = String(full).replace(/^(นาย|นางสาว|นาง)\s*/, "").trim().split(/\s+/);
  return parts[0] || "";
}

function relativeLabel(date, today) {
  const diff = Math.round((startOfDay(date) - today) / DAY_MS);
  if (diff === 0) return "วันนี้";
  if (diff === 1) return "พรุ่งนี้";
  if (diff > 1 && diff <= 7) return `อีก ${diff} วัน`;
  return thShort(date);
}

function typeTone(type = "") {
  if (type.includes("รายงาน")) return "orange";
  if (type.includes("นัด")) return "blue";
  if (type.includes("กิจกรรม")) return "purple";
  return "gray";
}

function statusTone(status = "") {
  if (status === "อาจารย์ตรวจแล้ว" || status === "อนุมัติแล้ว") return "green";
  if (status === "ต้องแก้ไข") return "red";
  if (status === "ส่งแล้ว" || status === "รอตรวจ") return "blue";
  return "gray";
}

const RING_R = 54;
const RING_C = 2 * Math.PI * RING_R;
const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

/* --------------------------------------------------------- */

export default function StudentDashboard({ data, setPage }) {
  const {
    student = {},
    weeklyReports = [],
    activities = [],
    evaluations = [],
    announcements = [],
  } = data || {};

  const now = new Date();
  const today = startOfDay(now);

  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today);

  /* ---------- ข้อมูลหลักของนักศึกษา ---------- */
  const name = student.name || "";
  const start = toDate(student.internshipStart);
  const end = toDate(student.internshipEnd);
  const totalWeeks = Number(student.totalWeeks) > 0 ? Number(student.totalWeeks) : 16;

  const currentWeek = start
    ? Math.min(totalWeeks, Math.max(1, Math.floor((today - startOfDay(start)) / (7 * DAY_MS)) + 1))
    : Number(student.currentWeek) || 1;

  const timePct =
    start && end && end > start
      ? Math.min(100, Math.max(0, Math.round(((today - startOfDay(start)) / (end - start)) * 100)))
      : 0;
  const overallPct = Number.isFinite(Number(student.progress)) && student.progress > 0
    ? Math.round(Number(student.progress))
    : timePct;

  /* ---------- รายงาน ---------- */
  const submittedWeekly = weeklyReports.filter((r) => r.status && r.status !== "ร่าง");
  const dueByNow = Math.min(totalWeeks, Math.max(currentWeek - 1, 0));
  const needFixWeekly = weeklyReports.filter((r) => r.status === "ต้องแก้ไข");
  const currentWeekSubmitted = weeklyReports.some(
    (r) => r.weekNumber === currentWeek && r.status && r.status !== "ร่าง"
  );

  const tasks = [];
  needFixWeekly.forEach((r) => tasks.push(`แก้ไขรายงานสัปดาห์ที่ ${r.weekNumber}`));
  if (!currentWeekSubmitted) tasks.push(`ส่งรายงานสัปดาห์ที่ ${currentWeek}`);

  /* ---------- ชั่วโมง ---------- */
  const totalHours = Number(student.totalHours) || 0;
  const requiredHours = Number(student.requiredHours) || 320;
  const hoursPct = Math.min(100, Math.round((totalHours / requiredHours) * 100));

  /* ---------- ผลประเมิน ---------- */
  const latestEval = evaluations[0];
  const evalScore = latestEval ? Number(latestEval.score) : null;

  /* ---------- กิจกรรมที่กำลังจะถึง ---------- */
  const upcoming = useMemo(
    () =>
      activities
        .map((a) => ({ ...a, _d: toDate(a.activityDate) }))
        .filter((a) => a._d && startOfDay(a._d) >= today)
        .sort((a, b) => a._d - b._d)
        .slice(0, 4),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activities]
  );

  /* ---------- ความเห็นล่าสุดจากอาจารย์ ---------- */
  const latestFeedback = useMemo(
    () =>
      weeklyReports
        .filter((r) => r.advisorComment)
        .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))[0],
    [weeklyReports]
  );

  /* ---------- ไทม์ไลน์การฝึกงาน ---------- */
  const midDate =
    latestEval?.createdAt
      ? toDate(latestEval.createdAt)
      : start
      ? new Date(startOfDay(start).getTime() + (Math.floor(totalWeeks / 2) * 7 - 1) * DAY_MS)
      : null;
  const steps = [
    { title: "ปฐมนิเทศและเริ่มงาน", date: start, done: !!start && start <= now },
    { title: "ประเมินผลกลางภาค", date: midDate, done: !!latestEval },
    {
      title: "ส่งรายงานฉบับสมบูรณ์",
      date: end ? new Date(end.getTime() - 14 * DAY_MS) : null,
      done: !!end && new Date(end.getTime() - 14 * DAY_MS) <= now,
    },
    { title: "สิ้นสุดการฝึกงาน", date: end, done: !!end && end <= now },
  ];
  const activeIndex = steps.findIndex((s) => !s.done);

  /* ---------- ปฏิทิน ---------- */
  const eventsByDay = useMemo(() => {
    const map = {};
    activities.forEach((a) => {
      const d = toDate(a.activityDate);
      if (!d) return;
      (map[ymd(d)] = map[ymd(d)] || []).push(a);
    });
    return map;
  }, [activities]);

  const monthCells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells = Array(first.getDay()).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    return cells;
  }, [cursor]);

  const selectedEvents = (eventsByDay[ymd(selected)] || [])
    .slice()
    .sort((a, b) => String(a.time).localeCompare(String(b.time)));

  const quote = QUOTES[Math.floor(today / DAY_MS) % QUOTES.length];

  /* ===================================================== */

  return (
    <div className="dx-page">
      {/* ---------- HERO ---------- */}
      <section className="dx-hero">
        <div className="dx-hero-text">
          <span className="dx-eyebrow">
            {thDay(now)} · สัปดาห์ที่ {currentWeek} จาก {totalWeeks}
          </span>
          <h1>
            {greeting(now.getHours())}
            {firstName(name) ? `, ${firstName(name)}` : ""}
          </h1>
          <p className="dx-hero-sub">
            {tasks.length
              ? `วันนี้มี ${tasks.length} เรื่องที่ควรจัดการ: ${tasks.slice(0, 2).join(" และ ")}${tasks.length > 2 ? " และอื่น ๆ" : ""}`
              : "ตอนนี้ไม่มีงานค้าง ทำได้ดีมาก!"}
          </p>
          <p className="dx-hero-quote">“{quote}”</p>
          <div className="dx-hero-actions">
            <button className="dx-btn dx-btn-light" onClick={() => setPage("reports")}>
              เขียนรายงาน
            </button>
            <button className="dx-btn dx-btn-ghost" onClick={() => setPage("chat")}>
              คุยกับอาจารย์
            </button>
          </div>
        </div>

        <div className="dx-hero-side">
          <div className="dx-hero-chip">
            <small>สถานประกอบการ</small>
            <b>{student.company || "-"}</b>
          </div>
          <div className="dx-hero-chip">
            <small>ตำแหน่ง</small>
            <b>{student.position || "-"}</b>
          </div>
          <div className="dx-hero-chip">
            <small>เหลือเวลาอีก</small>
            <b>
              {end ? `${Math.max(0, Math.ceil((end - now) / DAY_MS))} วัน` : "-"}
            </b>
          </div>
        </div>
      </section>

      {/* ---------- STATS ---------- */}
      <section className="dx-stats">
        <article className="dx-stat">
          <div className="dx-stat-icon blue">▤</div>
          <div className="dx-stat-body">
            <p>รายงานประจำสัปดาห์ที่ส่งแล้ว</p>
            <div className="dx-stat-num">
              {submittedWeekly.length}
              <span>/ {totalWeeks} ฉบับ</span>
            </div>
            <div className="dx-bar">
              <i className="blue" style={{ width: `${Math.round((submittedWeekly.length / totalWeeks) * 100)}%` }} />
            </div>
            <small>ตามกำหนด ณ ตอนนี้ควรส่งแล้ว {dueByNow} ฉบับ</small>
          </div>
        </article>

        <article className="dx-stat">
          <div className="dx-stat-icon green">◷</div>
          <div className="dx-stat-body">
            <p>ชั่วโมงฝึกงานสะสม</p>
            <div className="dx-stat-num">
              {totalHours}
              <span>/ {requiredHours} ชม.</span>
            </div>
            <div className="dx-bar">
              <i className="green" style={{ width: `${hoursPct}%` }} />
            </div>
            <small>คิดเป็น {hoursPct}% ของชั่วโมงที่กำหนด</small>
          </div>
        </article>

        <article className="dx-stat dx-stat-click" onClick={() => setPage("reports")}>
          <div className="dx-stat-icon orange">!</div>
          <div className="dx-stat-body">
            <p>งานที่ต้องดำเนินการ</p>
            <div className="dx-stat-num">
              {tasks.length}
              <span>รายการ</span>
            </div>
            <small>{tasks.length ? tasks[0] : "ไม่มีงานค้างในขณะนี้"}</small>
          </div>
          <span className="dx-arrow">›</span>
        </article>

        <article className="dx-stat dx-stat-click" onClick={() => setPage("evaluation")}>
          <div className="dx-stat-icon purple">★</div>
          <div className="dx-stat-body">
            <p>คะแนนประเมินล่าสุด</p>
            <div className="dx-stat-num">
              {evalScore !== null ? evalScore.toFixed(1) : "-"}
              <span>/ 5</span>
            </div>
            <div className="dx-stars" aria-label={evalScore !== null ? `${evalScore} จาก 5 ดาว` : "ยังไม่มีผลประเมิน"}>
              {[1, 2, 3, 4, 5].map((n) => (
                <i key={n} className={evalScore !== null && n <= Math.round(evalScore) ? "on" : ""}>★</i>
              ))}
            </div>
            <small>{latestEval ? `ประเมินเมื่อ ${thShort(latestEval.createdAt)}` : "ยังไม่มีผลประเมิน"}</small>
          </div>
          <span className="dx-arrow">›</span>
        </article>
      </section>

      {/* ---------- MAIN GRID ---------- */}
      <div className="dx-grid">
        {/* ===== คอลัมน์ซ้าย ===== */}
        <div className="dx-col">
          <section className="dx-card">
            <header className="dx-card-head">
              <h2>ข้อมูลการฝึกงาน</h2>
              <button className="dx-link" onClick={() => setPage("internship")}>ดูรายละเอียด →</button>
            </header>

            <div className="dx-info">
              <div>
                <small>สถานประกอบการ</small>
                <b>{student.company || "-"}</b>
              </div>
              <div>
                <small>ตำแหน่ง</small>
                <b>{student.position || "-"}</b>
              </div>
              <div>
                <small>พี่เลี้ยงงาน</small>
                <b>{student.mentorName || "-"}</b>
                {student.mentorPosition && <em>{student.mentorPosition}</em>}
              </div>
              <div>
                <small>ระยะเวลา</small>
                <b>{thShort(start)} – {thShort(end)}</b>
              </div>
            </div>

            <div className="dx-progress">
              <div className="dx-ring" role="img" aria-label={`ความก้าวหน้า ${overallPct}%`}>
                <svg viewBox="0 0 130 130">
                  <circle cx="65" cy="65" r={RING_R} className="dx-ring-bg" />
                  <circle
                    cx="65"
                    cy="65"
                    r={RING_R}
                    className="dx-ring-fg"
                    strokeDasharray={RING_C}
                    strokeDashoffset={RING_C * (1 - overallPct / 100)}
                  />
                </svg>
                <div className="dx-ring-text">
                  <strong>{overallPct}%</strong>
                  <span>ความก้าวหน้า</span>
                </div>
              </div>

              <ol className="dx-steps">
                {steps.map((s, i) => (
                  <li key={s.title} className={s.done ? "done" : i === activeIndex ? "active" : ""}>
                    <i>{s.done ? "✓" : ""}</i>
                    <div>
                      <b>{s.title}</b>
                      <span>{thShort(s.date)}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="dx-card">
            <header className="dx-card-head">
              <h2>รายงานล่าสุด</h2>
              <button className="dx-link" onClick={() => setPage("reports")}>จัดการรายงาน →</button>
            </header>

            {weeklyReports.length === 0 ? (
              <p className="dx-empty">ยังไม่มีรายงาน เริ่มเขียนรายงานสัปดาห์แรกได้ที่เมนู “บันทึกรายงาน”</p>
            ) : (
              <ul className="dx-reports">
                {weeklyReports.slice(0, 4).map((r) => (
                  <li key={r._id || r.weekNumber}>
                    <div className="dx-week">W{r.weekNumber}</div>
                    <div className="dx-report-main">
                      <b>{r.workTitle}</b>
                      <span>{thShort(r.startDate)} – {thShort(r.endDate)}</span>
                    </div>
                    <span className={`dx-pill ${statusTone(r.status)}`}>{r.status}</span>
                  </li>
                ))}
              </ul>
            )}

            {latestFeedback && (
              <blockquote className="dx-feedback">
                <small>ความเห็นล่าสุดจากอาจารย์ · รายงานสัปดาห์ที่ {latestFeedback.weekNumber}</small>
                <p>{latestFeedback.advisorComment}</p>
              </blockquote>
            )}
          </section>
        </div>

        {/* ===== คอลัมน์ขวา ===== */}
        <div className="dx-col">
          <section className="dx-card">
            <header className="dx-card-head">
              <h2>กิจกรรมที่กำลังจะถึง</h2>
              <button className="dx-link" onClick={() => setPage("calendar")}>ปฏิทิน →</button>
            </header>

            {upcoming.length === 0 ? (
              <p className="dx-empty">ยังไม่มีกิจกรรมหรือนัดหมายที่กำลังจะถึง</p>
            ) : (
              <ul className="dx-activities">
                {upcoming.map((a) => (
                  <li key={a._id || `${a.title}-${a.activityDate}`}>
                    <div className={`dx-when ${typeTone(a.type)}`}>
                      <b>{a._d.getDate()}</b>
                      <span>{a._d.toLocaleDateString("th-TH", { month: "short" })}</span>
                    </div>
                    <div className="dx-activity-main">
                      <b>{a.title}</b>
                      <span>
                        {a.time || "ทั้งวัน"} · {relativeLabel(a._d, today)}
                      </span>
                    </div>
                    <span className={`dx-pill ${typeTone(a.type)}`}>{a.type || "ทั่วไป"}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="dx-card">
            <header className="dx-card-head">
              <h2>ประกาศล่าสุด</h2>
              <button className="dx-link" onClick={() => setPage("announcements")}>ดูทั้งหมด →</button>
            </header>

            {announcements.length === 0 ? (
              <p className="dx-empty">ยังไม่มีประกาศจากอาจารย์</p>
            ) : (
              <ul className="dx-news">
                {announcements.slice(0, 3).map((n) => (
                  <li key={n._id || n.title}>
                    <span className={`dx-pill ${n.type === "สำคัญ" ? "red" : n.type === "กำหนดการ" ? "orange" : "blue"}`}>
                      {n.type || "ทั่วไป"}
                    </span>
                    <b>{n.title}</b>
                    <small>{thShort(n.publishDate || n.createdAt)}</small>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="dx-card">
            <header className="dx-card-head">
              <h2>ปฏิทินการฝึกงาน</h2>
            </header>

            <div className="dx-cal-head">
              <button
                aria-label="เดือนก่อนหน้า"
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              >
                ‹
              </button>
              <strong>
                {cursor.toLocaleDateString("th-TH", { month: "long", year: "numeric" })}
              </strong>
              <button
                aria-label="เดือนถัดไป"
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              >
                ›
              </button>
            </div>

            <div className="dx-cal-week">
              {WEEKDAYS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="dx-cal-grid">
              {monthCells.map((d, i) =>
                d ? (
                  <button
                    key={i}
                    className={[
                      ymd(d) === ymd(today) ? "today" : "",
                      ymd(d) === ymd(selected) ? "selected" : "",
                      eventsByDay[ymd(d)] ? "has-event" : "",
                    ].join(" ")}
                    onClick={() => setSelected(d)}
                  >
                    {d.getDate()}
                  </button>
                ) : (
                  <span key={i} />
                )
              )}
            </div>

            <div className="dx-cal-events">
              <small>{thDay(selected)}</small>
              {selectedEvents.length === 0 ? (
                <p className="dx-empty small">ไม่มีกิจกรรมในวันนี้</p>
              ) : (
                selectedEvents.map((a) => (
                  <div key={a._id || a.title} className="dx-cal-event">
                    <i className={typeTone(a.type)} />
                    <span>{a.time || "ทั้งวัน"}</span>
                    <b>{a.title}</b>
                  </div>
                ))
              )}
            </div>

            <button className="dx-btn dx-btn-outline dx-full" onClick={() => setPage("chat")}>
              ติดต่ออาจารย์ที่ปรึกษา
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
