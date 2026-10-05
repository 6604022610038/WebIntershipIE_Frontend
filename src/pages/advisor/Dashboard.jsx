import Card from "../../components/Card";
import Badge from "../../components/Badge";
import PageTitle from "../../components/PageTitle";

import "./advisor.css";

export default function AdvisorDashboard({
  data = {},
  setPage,
}) {
  const students = Array.isArray(data.students)
    ? data.students
    : [];

  const weeklyReports = Array.isArray(data.weeklyReports)
    ? data.weeklyReports
    : [];

  const notifications = Array.isArray(data.notifications)
    ? data.notifications
    : [];

  // ==========================================
  // STATUS
  // ==========================================

  const pendingReports = weeklyReports.filter((report) =>
    isPending(report.status)
  );

  const needFixReports = weeklyReports.filter((report) =>
    isNeedFix(report.status)
  );

  const approvedReports = weeklyReports.filter((report) =>
    isApproved(report.status)
  );

  const unreadNotifications = notifications.filter(
    (item) =>
      !item.isRead &&
      !item.read
  );

  // รายงานล่าสุด
  const recentReports = [...weeklyReports]
    .sort((a, b) => {
      const dateA = new Date(
        a.createdAt ||
        a.reportDate ||
        a.updatedAt ||
        0
      );

      const dateB = new Date(
        b.createdAt ||
        b.reportDate ||
        b.updatedAt ||
        0
      );

      return dateB - dateA;
    })
    .slice(0, 6);

  // แจ้งเตือนล่าสุด
  const recentNotifications = [...notifications]
    .sort((a, b) => {
      const dateA = new Date(
        a.createdAt ||
        a.date ||
        0
      );

      const dateB = new Date(
        b.createdAt ||
        b.date ||
        0
      );

      return dateB - dateA;
    })
    .slice(0, 5);

  function goTo(page) {
    if (typeof setPage === "function") {
      setPage(page);
    }
  }

  return (
    <div className="content advisor-dashboard-page">

      {/* ==========================================
          HEADER
      ========================================== */}

      <PageTitle
        title="หน้าหลักอาจารย์ที่ปรึกษา"
        subtitle="งานที่ต้องดำเนินการและกิจกรรมล่าสุดของนักศึกษา"
        action={
          <button
            className="advisor-command-btn"
            onClick={() =>
              goTo("advisor-command-center")
            }
          >
            ◆ เปิด Command Center
          </button>
        }
      />

      {/* ==========================================
          TODAY SUMMARY
      ========================================== */}

      <div className="advisor-work-banner">

        <div>
          <span className="advisor-work-label">
            ADVISOR WORKSPACE
          </span>

          <h2>
            งานที่ต้องจัดการวันนี้
          </h2>

          <p>
            ตรวจรายงาน ติดตามนักศึกษา
            และจัดการการแจ้งเตือนจากระบบ
          </p>
        </div>

        <div className="advisor-work-actions">

          <button
            className="primary-action"
            onClick={() =>
              goTo("advisor-reports")
            }
          >
            📝 ตรวจรายงาน
            {pendingReports.length > 0 && (
              <b>
                {pendingReports.length}
              </b>
            )}
          </button>

          <button
            className="secondary-action"
            onClick={() =>
              goTo("advisor-students")
            }
          >
            👥 ดูนักศึกษา
          </button>

        </div>

      </div>


      {/* ==========================================
          WORK QUEUE
          เน้น "งาน" ไม่ใช่ Analytics
      ========================================== */}

      <div className="advisor-work-grid">

        <WorkCard
          icon="📝"
          tone="orange"
          title="รายงานรอตรวจ"
          value={pendingReports.length}
          suffix="ฉบับ"
          description={
            pendingReports.length
              ? "มีรายงานที่ต้องตรวจสอบ"
              : "ไม่มีรายงานค้างตรวจ"
          }
          buttonText="ไปตรวจรายงาน →"
          onClick={() =>
            goTo("advisor-reports")
          }
        />

        <WorkCard
          icon="🛠️"
          tone="red"
          title="รายงานต้องแก้ไข"
          value={needFixReports.length}
          suffix="ฉบับ"
          description={
            needFixReports.length
              ? "นักศึกษาต้องแก้ไขรายงาน"
              : "ไม่มีรายงานที่ต้องแก้ไข"
          }
          buttonText="ดูรายงาน →"
          onClick={() =>
            goTo("advisor-reports")
          }
        />

        <WorkCard
          icon="🔔"
          tone="purple"
          title="การแจ้งเตือนใหม่"
          value={unreadNotifications.length}
          suffix="รายการ"
          description={
            unreadNotifications.length
              ? "มีการแจ้งเตือนที่ยังไม่ได้อ่าน"
              : "ไม่มีการแจ้งเตือนใหม่"
          }
          buttonText="ดูการแจ้งเตือน →"
          onClick={() =>
            goTo("advisor-notifications")
          }
        />

        <WorkCard
          icon="👥"
          tone="blue"
          title="นักศึกษาในความดูแล"
          value={students.length}
          suffix="คน"
          description="นักศึกษาที่อาจารย์ดูแลอยู่ในระบบ"
          buttonText="จัดการนักศึกษา →"
          onClick={() =>
            goTo("advisor-students")
          }
        />

      </div>


      {/* ==========================================
          MAIN WORK AREA
      ========================================== */}

      <div className="advisor-dashboard-columns">

        {/* ========================================
            PENDING REPORTS
        ======================================== */}

        <Card
          title="📝 รายงานที่ต้องดำเนินการ"
          action={
            <button
              className="text-btn"
              onClick={() =>
                goTo("advisor-reports")
              }
            >
              ดูทั้งหมด →
            </button>
          }
        >

          {pendingReports.length > 0 ? (

            <div className="advisor-task-list">

              {pendingReports
                .slice(0, 6)
                .map((report, index) => {

                  const student =
                    students.find(
                      (student) =>
                        String(student.studentId || "") ===
                        String(report.studentId || "")
                    );

                  const studentName =
                    student?.name ||
                    report.studentName ||
                    report.student?.name ||
                    report.studentId ||
                    "ไม่ระบุชื่อ";

                  const week =
                    report.weekNumber ??
                    report.week ??
                    "-";

                  return (
                    <button
                      key={
                        report._id ||
                        `${report.studentId}-${week}-${index}`
                      }
                      className="advisor-task-item"
                      onClick={() =>
                        goTo("advisor-reports")
                      }
                    >

                      <div className="advisor-task-icon orange">
                        📝
                      </div>

                      <div className="advisor-task-content">

                        <strong>
                          {studentName}
                        </strong>

                        <span>
                          รายงานสัปดาห์ที่ {week}
                          {" · "}
                          {formatDate(
                            report.createdAt ||
                            report.reportDate ||
                            report.updatedAt
                          )}
                        </span>

                      </div>

                      <Badge tone="orange">
                        รอตรวจ
                      </Badge>

                    </button>
                  );
                })}

            </div>

          ) : (

            <EmptyState
              icon="✓"
              title="ไม่มีรายงานค้างตรวจ"
              text="ตอนนี้ไม่มีรายงานที่ต้องดำเนินการ"
            />

          )}

        </Card>


        {/* ========================================
            NOTIFICATIONS
        ======================================== */}

        <Card
          title="🔔 การแจ้งเตือนล่าสุด"
          action={
            <button
              className="text-btn"
              onClick={() =>
                goTo("advisor-notifications")
              }
            >
              ดูทั้งหมด →
            </button>
          }
        >

          {recentNotifications.length > 0 ? (

            <div className="advisor-notification-list">

              {recentNotifications.map(
                (notification, index) => {

                  const title =
                    notification.title ||
                    notification.message ||
                    notification.text ||
                    "การแจ้งเตือน";

                  const description =
                    notification.description ||
                    notification.detail ||
                    "";

                  const unread =
                    !notification.isRead &&
                    !notification.read;

                  return (
                    <button
                      key={
                        notification._id ||
                        notification.id ||
                        index
                      }
                      className={`advisor-notification-item ${
                        unread
                          ? "unread"
                          : ""
                      }`}
                      onClick={() =>
                        goTo("advisor-notifications")
                      }
                    >

                      <div className="notification-dot">
                        {unread ? "●" : "○"}
                      </div>

                      <div>

                        <strong>
                          {title}
                        </strong>

                        {description && (
                          <span>
                            {description}
                          </span>
                        )}

                        <small>
                          {formatDate(
                            notification.createdAt ||
                            notification.date
                          )}
                        </small>

                      </div>

                    </button>
                  );
                }
              )}

            </div>

          ) : (

            <EmptyState
              icon="🔔"
              title="ไม่มีการแจ้งเตือน"
              text="ยังไม่มีการแจ้งเตือนใหม่จากระบบ"
            />

          )}

        </Card>

      </div>


      {/* ==========================================
          RECENT REPORT ACTIVITY
      ========================================== */}

      <Card
        title="📋 กิจกรรมรายงานล่าสุด"
        action={
          <button
            className="text-btn"
            onClick={() =>
              goTo("advisor-reports")
            }
          >
            จัดการรายงาน →
          </button>
        }
      >

        {recentReports.length > 0 ? (

          <div className="advisor-recent-table">

            <div className="advisor-recent-head">
              <span>นักศึกษา</span>
              <span>รายงาน</span>
              <span>วันที่</span>
              <span>สถานะ</span>
            </div>

            {recentReports.map(
              (report, index) => {

                const student =
                  students.find(
                    (item) =>
                      String(item.studentId || "") ===
                      String(report.studentId || "")
                  );

                const name =
                  student?.name ||
                  report.studentName ||
                  report.student?.name ||
                  report.studentId ||
                  "ไม่ระบุชื่อ";

                const status =
                  report.status ||
                  "ไม่ระบุสถานะ";

                return (
                  <button
                    key={
                      report._id ||
                      index
                    }
                    className="advisor-recent-row"
                    onClick={() =>
                      goTo("advisor-reports")
                    }
                  >

                    <span className="advisor-person">
                      <span className="avatar tiny">
                        {name.charAt(0)}
                      </span>

                      <span>
                        <strong>
                          {name}
                        </strong>

                        <small>
                          {report.studentId || "-"}
                        </small>
                      </span>
                    </span>

                    <span>
                      รายงานสัปดาห์ที่{" "}
                      {report.weekNumber ??
                        report.week ??
                        "-"}
                    </span>

                    <span>
                      {formatDate(
                        report.createdAt ||
                        report.reportDate ||
                        report.updatedAt
                      )}
                    </span>

                    <span>
                      <Badge
                        tone={getStatusTone(status)}
                      >
                        {status}
                      </Badge>
                    </span>

                  </button>
                );
              }
            )}

          </div>

        ) : (

          <EmptyState
            icon="📋"
            title="ยังไม่มีรายงาน"
            text="เมื่อมีนักศึกษาส่งรายงาน กิจกรรมจะแสดงที่นี่"
          />

        )}

      </Card>


      {/* ==========================================
          QUICK ACTIONS
      ========================================== */}

      <Card title="⚡ เมนูการทำงาน">

        <div className="advisor-quick-actions">

          <QuickAction
            icon="👥"
            title="นักศึกษา"
            description="ดูและจัดการนักศึกษาในความดูแล"
            onClick={() =>
              goTo("advisor-students")
            }
          />

          <QuickAction
            icon="📝"
            title="รายงาน"
            description="ตรวจสอบและจัดการรายงาน"
            onClick={() =>
              goTo("advisor-reports")
            }
          />

          <QuickAction
            icon="⭐"
            title="ผลประเมิน"
            description="ดูผลการประเมินการฝึกงาน"
            onClick={() =>
              goTo("advisor-evaluations")
            }
          />

          <QuickAction
            icon="📢"
            title="ประกาศ"
            description="สร้างและจัดการประกาศ"
            onClick={() =>
              goTo("advisor-announcements")
            }
          />

          <QuickAction
            icon="📅"
            title="ปฏิทิน"
            description="ดูตารางและกำหนดการ"
            onClick={() =>
              goTo("advisor-calendar")
            }
          />

          <QuickAction
            icon="◆"
            title="Command Center"
            description="วิเคราะห์ความเสี่ยงและภาพรวม"
            onClick={() =>
              goTo("advisor-command-center")
            }
            highlight
          />

        </div>

      </Card>


      {/* ==========================================
          COMPLETED INFO
      ========================================== */}

      <div className="advisor-dashboard-footer">

        <span>
          ✓ ตรวจแล้ว {approvedReports.length} รายงาน
        </span>

        <span>
          •
        </span>

        <span>
          นักศึกษา {students.length} คน
        </span>

        <span>
          •
        </span>

        <button
          onClick={() =>
            goTo("advisor-command-center")
          }
        >
          เปิดศูนย์วิเคราะห์ →
        </button>

      </div>

    </div>
  );
}


/* =================================================
   WORK CARD
================================================= */

function WorkCard({
  icon,
  tone,
  title,
  value,
  suffix,
  description,
  buttonText,
  onClick,
}) {
  return (
    <div
      className={`advisor-work-card ${tone}`}
    >

      <div className="advisor-work-card-top">

        <div className="advisor-work-card-icon">
          {icon}
        </div>

        <div>

          <span className="advisor-work-card-title">
            {title}
          </span>

          <div className="advisor-work-card-value">
            {value}
            <small>
              {suffix}
            </small>
          </div>

        </div>

      </div>

      <p>
        {description}
      </p>

      <button
        onClick={onClick}
      >
        {buttonText}
      </button>

    </div>
  );
}


/* =================================================
   QUICK ACTION
================================================= */

function QuickAction({
  icon,
  title,
  description,
  onClick,
  highlight = false,
}) {
  return (
    <button
      className={`advisor-quick-action ${
        highlight
          ? "highlight"
          : ""
      }`}
      onClick={onClick}
    >

      <div className="quick-action-icon">
        {icon}
      </div>

      <div>

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>

      <b>
        →
      </b>

    </button>
  );
}


/* =================================================
   EMPTY STATE
================================================= */

function EmptyState({
  icon,
  title,
  text,
}) {
  return (
    <div className="advisor-empty-state">

      <div>
        {icon}
      </div>

      <strong>
        {title}
      </strong>

      <span>
        {text}
      </span>

    </div>
  );
}


/* =================================================
   STATUS HELPERS
================================================= */

function isPending(status) {
  const value =
    String(status || "")
      .toLowerCase();

  return (
    value === "ส่งแล้ว" ||
    value === "รอตรวจสอบ" ||
    value === "submitted" ||
    value === "pending"
  );
}


function isNeedFix(status) {
  const value =
    String(status || "")
      .toLowerCase();

  return (
    value.includes("ต้องแก้ไข") ||
    value.includes("แก้ไข") ||
    value.includes("ต้องปรับปรุง") ||
    value === "rejected"
  );
}


function isApproved(status) {
  const value =
    String(status || "")
      .toLowerCase();

  return (
    value.includes("ผ่าน") ||
    value.includes("ตรวจแล้ว") ||
    value === "approved"
  );
}


function getStatusTone(status) {
  const value =
    String(status || "")
      .toLowerCase();

  if (isApproved(value)) {
    return "green";
  }

  if (isNeedFix(value)) {
    return "red";
  }

  if (isPending(value)) {
    return "orange";
  }

  return "blue";
}


/* =================================================
   DATE
================================================= */

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleDateString(
    "th-TH",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}