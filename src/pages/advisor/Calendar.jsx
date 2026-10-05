import { useEffect, useMemo, useState } from "react";

import Card from "../../components/Card";
import Modal from "../../components/Modal";
import PageTitle from "../../components/PageTitle";
import Empty from "../../components/Empty";

import { api } from "../../services/api";

import "./advisor.css";
import "../../styles/calendar.css";

const WEEKDAYS_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

function pad2(n) {
  return String(n).padStart(2, "0");
}

// key แบบ "YYYY-MM-DD" จาก Date object (ใช้เวลาท้องถิ่น ไม่ผ่าน UTC)
function dateKey(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// key แบบ "YYYY-MM-DD" จาก ISO string ที่ backend ส่งมา (ตัดตรง ๆ กันปัญหาเหลื่อม timezone)
function isoDateKey(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function fmtDayHeader(key) {
  if (!key) return "";

  const d = new Date(`${key}T00:00:00`);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// สร้างตารางเดือน 6 สัปดาห์ (42 วัน) เริ่มวันอาทิตย์
function buildMonthGrid(cursor) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();

  const gridStart = new Date(year, month, 1 - startOffset);

  const days = [];

  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }

  return days;
}

export default function AdvisorCalendar({ setPage, activities = [], refresh }) {
  const today = new Date();
  const todayKey = dateKey(today);

  const [monthCursor, setMonthCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedKey, setSelectedKey] = useState(todayKey);

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);

  const [f, setF] = useState({
    title: "",
    description: "",
    activityDate: todayKey,
    time: "09:00 น.",
    type: "ทั่วไป",
  });

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    api("/announcements")
      .then((list) => {
        if (!cancelled) setAnnouncements(list || []);
      })
      .catch(() => {
        if (!cancelled) setAnnouncements([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // กิจกรรมที่อาจารย์ปักหมุดไว้เอง (แยกจากกิจกรรมส่วนตัวของนักศึกษาแต่ละคน)
  const ownActivities = useMemo(
    () => activities.filter((a) => a.studentId === "ADVISOR"),
    [activities]
  );

  const activitiesByDay = useMemo(() => {
    const map = {};

    ownActivities.forEach((a) => {
      const key = isoDateKey(a.activityDate);
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });

    return map;
  }, [ownActivities]);

  const announcementsByDay = useMemo(() => {
    const map = {};

    announcements.forEach((n) => {
      const key = isoDateKey(n.publishDate || n.createdAt);
      if (!map[key]) map[key] = [];
      map[key].push(n);
    });

    return map;
  }, [announcements]);

  const gridDays = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);

  const selectedDayActivities = activitiesByDay[selectedKey] || [];
  const selectedDayAnnouncements = announcementsByDay[selectedKey] || [];

  function prevMonth() {
    setMonthCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  }

  function nextMonth() {
    setMonthCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  }

  function goToday() {
    setMonthCursor(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedKey(todayKey);
  }

  function selectDay(d) {
    setSelectedKey(dateKey(d));
  }

  function openCreateForDay(key) {
    setEditing(null);

    setF({
      title: "",
      description: "",
      activityDate: key || todayKey,
      time: "09:00 น.",
      type: "ทั่วไป",
    });

    setShow(true);
  }

  function openEdit(a) {
    setEditing(a);

    setF({
      title: a.title || "",
      description: a.description || "",
      activityDate: a.activityDate ? a.activityDate.slice(0, 10) : "",
      time: a.time || "",
      type: a.type || "ทั่วไป",
    });

    setShow(true);
  }

  async function save(e) {
    e.preventDefault();

    try {
      const path = editing ? `/activities/${editing._id}` : "/activities";

      await api(path, {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(f),
      });

      setShow(false);
      setEditing(null);

      refresh && refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  async function remove(id) {
    if (!confirm("ต้องการลบกิจกรรมนี้หรือไม่?")) {
      return;
    }

    try {
      await api(`/activities/${id}`, {
        method: "DELETE",
      });

      refresh && refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="content">
      <PageTitle
        title="ปฏิทินของอาจารย์"
        subtitle="กำหนดนัดหมาย กิจกรรมของอาจารย์ และดูว่าวันไหนมีประกาศบ้าง"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="primary"
              onClick={() => openCreateForDay(selectedKey)}
            >
              ＋ เพิ่มกิจกรรม
            </button>

            {setPage && (
              <button
                type="button"
                className="secondary"
                onClick={() => setPage("advisor-announcements")}
              >
                ＋ จัดการประกาศ
              </button>
            )}
          </div>
        }
      />

      <Card>
        <div className="month-calendar">
          <div className="month-calendar-nav">
            <button type="button" className="nav-btn" onClick={prevMonth}>
              ‹
            </button>

            <div className="month-calendar-title">
              <strong>
                {THAI_MONTHS[monthCursor.getMonth()]}{" "}
                {monthCursor.getFullYear() + 543}
              </strong>

              <button type="button" className="today-btn" onClick={goToday}>
                วันนี้
              </button>
            </div>

            <button type="button" className="nav-btn" onClick={nextMonth}>
              ›
            </button>
          </div>

          <div className="month-calendar-weekdays">
            {WEEKDAYS_TH.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className="month-calendar-grid">
            {gridDays.map((d) => {
              const key = dateKey(d);
              const inMonth = d.getMonth() === monthCursor.getMonth();
              const dayActs = activitiesByDay[key] || [];
              const dayAnns = announcementsByDay[key] || [];

              return (
                <button
                  type="button"
                  key={key}
                  className={
                    "day-cell" +
                    (!inMonth ? " outside" : "") +
                    (key === todayKey ? " today" : "") +
                    (key === selectedKey ? " selected" : "")
                  }
                  onClick={() => selectDay(d)}
                >
                  <span className="day-number">{d.getDate()}</span>

                  <span className="day-dots">
                    {dayActs.length > 0 && (
                      <span
                        className="day-dot activity"
                        title="มีกิจกรรม/นัดหมาย"
                      />
                    )}
                    {dayAnns.length > 0 && (
                      <span
                        className="day-dot announcement"
                        title="มีประกาศ"
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="month-calendar-legend">
            <span>
              <span className="day-dot activity" /> กิจกรรม/นัดหมาย
            </span>

            <span>
              <span className="day-dot announcement" /> ประกาศ
            </span>
          </div>
        </div>
      </Card>

      <Card title={`รายละเอียดวันที่ ${fmtDayHeader(selectedKey)}`}>
        <div className="day-detail">
          <div className="day-detail-section">
            <div className="day-detail-head">
              <h4>
                กิจกรรม/นัดหมายที่ปักหมุด ({selectedDayActivities.length})
              </h4>

              <button
                type="button"
                className="link-btn"
                onClick={() => openCreateForDay(selectedKey)}
              >
                ＋ เพิ่มในวันนี้
              </button>
            </div>

            {selectedDayActivities.length ? (
              selectedDayActivities.map((a) => (
                <div className="day-detail-item" key={a._id}>
                  <div>
                    <b>{a.title}</b>
                    <p>{a.description}</p>
                    <small>
                      {a.time} · {a.type}
                    </small>
                  </div>

                  <div className="form-actions">
                    <button
                      className="small-btn"
                      onClick={() => openEdit(a)}
                    >
                      แก้ไข
                    </button>

                    <button
                      className="small-btn danger-btn"
                      onClick={() => remove(a._id)}
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <Empty text="ไม่มีกิจกรรมที่ปักหมุดไว้ในวันนี้" />
            )}
          </div>

          <div className="day-detail-section">
            <div className="day-detail-head">
              <h4>ประกาศ ({selectedDayAnnouncements.length})</h4>

              {setPage && (
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setPage("advisor-announcements")}
                >
                  ＋ เพิ่มประกาศใหม่
                </button>
              )}
            </div>

            {selectedDayAnnouncements.length ? (
              selectedDayAnnouncements.map((n) => (
                <div className="day-detail-item announcement" key={n._id}>
                  <div>
                    <b>{n.title}</b>
                    <p>{n.content}</p>
                    <small>{n.type}</small>
                  </div>
                </div>
              ))
            ) : (
              <Empty
                text={
                  loading
                    ? "กำลังโหลดประกาศ..."
                    : "ไม่มีประกาศในวันนี้"
                }
              />
            )}
          </div>
        </div>
      </Card>

      {show && (
        <Modal
          title={editing ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรม"}
          onClose={() => {
            setShow(false);
            setEditing(null);
          }}
        >
          <form onSubmit={save}>
            <label>
              ชื่อกิจกรรม

              <input
                required
                value={f.title}
                onChange={(e) => setF({ ...f, title: e.target.value })}
              />
            </label>

            <label>
              วันที่

              <input
                required
                type="date"
                value={f.activityDate}
                onChange={(e) =>
                  setF({ ...f, activityDate: e.target.value })
                }
              />
            </label>

            <label>
              เวลา

              <input
                value={f.time}
                onChange={(e) => setF({ ...f, time: e.target.value })}
              />
            </label>

            <label>
              ประเภท

              <input
                value={f.type}
                onChange={(e) => setF({ ...f, type: e.target.value })}
              />
            </label>

            <label>
              รายละเอียด

              <textarea
                value={f.description}
                onChange={(e) =>
                  setF({ ...f, description: e.target.value })
                }
              />
            </label>

            <div className="form-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setShow(false)}
              >
                ยกเลิก
              </button>

              <button className="primary">
                {editing ? "บันทึกการแก้ไข" : "บันทึกกิจกรรม"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}