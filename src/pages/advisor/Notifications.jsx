import Card from "../../components/Card";
import PageTitle from "../../components/PageTitle";
import Badge from "../../components/Badge";

import { api } from "../../services/api";

import "./advisor.css";

export default function AdvisorNotifications({
  notifications = [],
  refresh,
  user,
}) {
  async function read(id) {
    try {
      await api(
        `/notifications/${id}/read`,
        {
          method: 'PUT',
        }
      );

      refresh();
    } catch (e) {
      alert(e.message);
    }
  }

  async function readAll() {
    try {
      const path =
        user.role === 'advisor'
          ? '/notifications/advisor/read-all'
          : `/notifications/student/${
              user.studentId ||
              user.username
            }/read-all`;

      await api(path, {
        method: 'PUT',
      });

      refresh();
    } catch (e) {
      alert(e.message);
    }
  }

  const unread =
    notifications.filter(
      (n) => !n.isRead
    ).length;

  return (
    <div className="content narrow">
      <PageTitle
        title="การแจ้งเตือน"
        subtitle="ติดตามสถานะรายงาน ข่าวสาร และกิจกรรมสำคัญ"
        action={
          <button
            className="secondary"
            onClick={readAll}
            disabled={!unread}
          >
            อ่านทั้งหมด
          </button>
        }
      />

      <Card
        title={`${unread} รายการที่ยังไม่ได้อ่าน`}
      >
        <div className="notification-list">
          {notifications.map(
            (n) => (
              <button
                key={n._id}
                className={
                  !n.isRead
                    ? 'unread'
                    : ''
                }
                onClick={() =>
                  read(n._id)
                }
              >
                <div
                  className={`notify-icon ${n.type}`}
                >
                  {n.type ===
                  'success'
                    ? '✓'
                    : n.type ===
                      'warning'
                    ? '!'
                    : '●'}
                </div>

                <div>
                  <b>
                    {n.title}
                  </b>

                  <span>
                    {n.detail}
                  </span>

                  <small>
                    {fmt(
                      n.createdAt
                    )}{' '}
                    {!n.isRead
                      ? '· ยังไม่ได้อ่าน'
                      : '· อ่านแล้ว'}
                  </small>
                </div>
              </button>
            )
          )}
        </div>

        {!notifications.length && (
          <Empty text="ไม่มีการแจ้งเตือน" />
        )}
      </Card>
    </div>
  );
}

// ==============================
// EMPTY COMPONENT
// ==============================

function Empty({
  text = "ไม่มีข้อมูล",
}) {
  return (
    <div
      style={{
        padding: "30px 15px",
        textAlign: "center",
        color: "#94a2b8",
        fontSize: "13px",
        width: "100%",
      }}
    >
      {text}
    </div>
  );
}


// ==============================
// DATE FORMAT
// ==============================

function fmt(date) {
  if (!date) {
    return "-";
  }

  try {
    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "-";
    }

    return d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    return "-";
  }
}