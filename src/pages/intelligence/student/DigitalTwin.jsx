import { useEffect, useState } from "react";

import { api } from "../../../services/api";

import Card from "../../../components/Card";
import Badge from "../../../components/Badge";
import PageTitle from "../../../components/PageTitle";
import ProgressRing from "../../../components/ProgressRing";
import JourneyTimeline from "../../../components/JourneyTimeline";
import "../../../components/components.css";

import "../../student/student.css";
import "./digitaltwin.css";

const RISK_LABEL = {
  low: "ปกติ ไม่มีความเสี่ยง",
  medium: "ควรติดตาม",
  high: "ต้องดูแลเร่งด่วน",
};

const RISK_TONE = {
  low: "green",
  medium: "orange",
  high: "red",
};

const SKILL_LABEL = {
  knowledge: "ความรู้ในงาน",
  performance: "ผลการปฏิบัติงาน",
  problemSolving: "การแก้ปัญหา",
  teamwork: "การทำงานเป็นทีม",
  ethics: "จรรยาบรรณ/วินัย",
};

/**
 * 👨‍🎓 Digital Twin
 * โปรไฟล์สถานะการฝึกงานแบบ Interactive ของนักศึกษา
 * รวมความคืบหน้า (Progress Intelligence), ความเสี่ยง (Risk Monitor)
 * และไทม์ไลน์การฝึกงาน (Internship Journey) ไว้ในหน้าเดียว
 */
export default function DigitalTwin({ user }) {
  const [twin, setTwin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const studentId = user?.studentId || user?.username;

  useEffect(() => {
    let ignore = false;
    if (!studentId) return;

    setLoading(true);
    setError("");

    api(`/intelligence/student/${studentId}`)
      .then((result) => {
        if (!ignore) setTwin(result);
      })
      .catch((err) => {
        if (!ignore) setError(err.message || "ไม่สามารถโหลดข้อมูลได้");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    const timer = window.setInterval(() => {
      api(`/intelligence/student/${studentId}`)
        .then((result) => {
          if (!ignore) setTwin(result);
        })
        .catch(() => {});
    }, 30000);

    return () => {
      ignore = true;
      window.clearInterval(timer);
    };
  }, [studentId]);

  async function refreshTwin() {
    if (!studentId) return;
    setRefreshing(true);
    setError("");
    try {
      const result = await api(`/intelligence/student/${studentId}`);
      setTwin(result);
    } catch (err) {
      setError(err.message || "ไม่สามารถอัปเดตข้อมูลได้");
    } finally {
      setRefreshing(false);
    }
  }

  if (loading && !twin) {
    return <div className="loading-page">กำลังวิเคราะห์ข้อมูลของคุณ...</div>;
  }

  if (error && !twin) {
    return (
      <div className="content">
        <PageTitle title="Digital Twin" subtitle="โปรไฟล์สถานะการฝึกงานแบบ Interactive" />
        <Card title="เกิดข้อผิดพลาด">
          <p style={{ color: "#e5484d", fontSize: 13 }}>{error}</p>
        </Card>
      </div>
    );
  }

  const {
    student = {},
    progress,
    risk,
    journey = [],
    skills = {},
    insight,
    recommendations = [],
    reportIntelligence,
    stats = {},
  } = twin || {};

  return (
    <div className="dashboard-page digital-twin-page">
      <PageTitle
        title="👨‍🎓 Digital Twin"
        subtitle="โปรไฟล์สถานะการฝึกงานที่คำนวณจากข้อมูลจริงในระบบ"
        action={
          <button className="twin-refresh-btn" onClick={refreshTwin} disabled={refreshing}>
            {refreshing ? "กำลังอัปเดต..." : "↻ อัปเดตข้อมูล"}
          </button>
        }
      />

      {/* ================= PROFILE + INSIGHT ================= */}
      <div className="twin-hero">
        <div className="twin-avatar">{(student.name || "น").charAt(0)}</div>

        <div className="twin-hero-info">
          <h2>{student.name || "นักศึกษา"}</h2>
          <p>
            {student.major || "-"} • {student.company || "ยังไม่ระบุสถานประกอบการ"}
            {student.position ? ` • ${student.position}` : ""}
          </p>
          {insight && <p className="twin-insight">🧠 {insight}</p>}
        </div>

        <Badge tone={RISK_TONE[risk?.level] || "blue"}>
          {RISK_LABEL[risk?.level] || "ไม่ทราบสถานะ"}
        </Badge>
      </div>

      {/* ================= REAL OPERATIONAL DATA ================= */}
      <div className="twin-live-grid">
        <LiveStat icon="⏱️" label="ชั่วโมงฝึกงาน" value={stats?.hours?.completed ?? 0} suffix={`/ ${stats?.hours?.required ?? 0} ชม.`} />
        <LiveStat icon="📝" label="รายงานทั้งหมด" value={stats?.weeklyReportCount ?? 0} suffix="ฉบับ" />
        <LiveStat icon="⭐" label="คะแนนประเมินเฉลี่ย" value={stats?.averageEvaluation ?? "-"} suffix={stats?.averageEvaluation != null ? "/ 5" : ""} />
        <LiveStat icon="🛠️" label="รายงานต้องแก้" value={stats?.reportStatus?.needFix ?? 0} suffix="ฉบับ" danger={stats?.reportStatus?.needFix > 0} />
      </div>

      {/* ================= PROGRESS + RISK ================= */}
      <div className="twin-grid">
        <Card title="📊 Progress Intelligence">
          <div className="twin-progress-row">
            <ProgressRing percent={progress?.percent || 0} label="ความคืบหน้ารวม" tone="blue" />

            <div className="twin-progress-breakdown">
              <BreakdownRow
                label="ตามกรอบเวลา"
                percent={progress?.breakdown?.time?.percent}
                detail={`สัปดาห์ที่ ${progress?.breakdown?.time?.weeksElapsed ?? 0} / ${
                  progress?.breakdown?.time?.totalWeeks ?? "-"
                }`}
              />
              <BreakdownRow
                label="การส่งรายงาน"
                percent={progress?.breakdown?.reports?.percent}
                detail={`ส่งแล้ว ${progress?.breakdown?.reports?.submitted ?? 0} / ควรส่ง ${
                  progress?.breakdown?.reports?.expectedByNow ?? 0
                } ฉบับ`}
              />
              <BreakdownRow
                label="ผลประเมิน"
                percent={progress?.breakdown?.evaluation?.percent}
                detail={
                  progress?.breakdown?.evaluation?.hasEvaluation
                    ? "มีผลประเมินล่าสุดแล้ว"
                    : "ยังไม่มีผลประเมิน"
                }
              />
            </div>
          </div>
        </Card>

        <Card title="🚦 Risk Monitor">
          <div className="risk-score-row">
            <span>ระดับความเสี่ยง</span>
            <Badge tone={RISK_TONE[risk?.level] || "blue"}>
              {RISK_LABEL[risk?.level] || "-"} ({risk?.score ?? 0}/100)
            </Badge>
          </div>

          {risk?.reasons?.length ? (
            <ul className="risk-reason-list">
              {risk.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: 12.5, color: "#65748e", marginTop: 8 }}>
              ไม่พบสัญญาณความเสี่ยงในขณะนี้ รักษามาตรฐานการส่งรายงานต่อไปได้เลย 🎉
            </p>
          )}
        </Card>
      </div>

      {/* ================= SMART RECOMMENDATIONS ================= */}
      <Card title="🧠 Smart Recommendation Engine">
        <div className="reco-list">
          {recommendations.map((r, i) => (
            <div className={`reco-item priority-${r.priority}`} key={i}>
              <div className="reco-icon">{r.icon}</div>
              <div className="reco-body">
                <h4>{r.title}</h4>
                <p>{r.detail}</p>
                {r.action && <p className="reco-action">▸ {r.action}</p>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="twin-pair">
      {/* ================= SKILLS ================= */}
      <Card title="🎯 ทักษะจากผลการประเมินล่าสุด">
        <div className="skill-bars">
          {Object.entries(SKILL_LABEL).map(([key, label]) => (
            <div className="skill-bar-row" key={key}>
              <span>{label}</span>
              <div className="skill-bar-track">
                <div
                  className="skill-bar-fill"
                  style={{ width: `${(Number(skills[key]) || 0) / 5 * 100}%` }}
                />
              </div>
              <span>{skills[key] || 0}/5</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ================= REPORT INTELLIGENCE ================= */}
      <Card title="📄 Report Intelligence">
        <div className="rq-summary-row">
          <div className="rq-summary-stat">
            <strong>{reportIntelligence?.avgQuality ?? 0}%</strong>
            <span>คะแนนคุณภาพเฉลี่ย</span>
          </div>
          <div className="rq-summary-stat">
            <strong>{reportIntelligence?.totalAnalyzed ?? 0}</strong>
            <span>รายงานที่วิเคราะห์แล้ว</span>
          </div>
          <div className="rq-summary-stat">
            <strong>{reportIntelligence?.flaggedCount ?? 0}</strong>
            <span>ฉบับที่ควรปรับปรุง</span>
          </div>
        </div>

        {reportIntelligence?.flagged?.length ? (
          <div className="rq-flag-list">
            {reportIntelligence.flagged.map((f, i) => (
              <div className="rq-flag-item" key={i}>
                <strong>
                  สัปดาห์ที่ {f.weekNumber ?? "-"}
                  {f.title ? ` — ${f.title}` : ""}
                </strong>
                : {f.flags.join(" • ")}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 12.5, color: "#65748e" }}>
            ไม่พบรายงานที่ต้องปรับปรุงเป็นพิเศษในขณะนี้ 🎉
          </p>
        )}
      </Card>

      </div>

      {/* ================= JOURNEY ================= */}
      <Card title="🗺️ Internship Journey">
        <JourneyTimeline events={journey} emptyText="ยังไม่มีเหตุการณ์บันทึกไว้" />
      </Card>
    </div>
  );
}

function LiveStat({ icon, label, value, suffix, danger = false }) {
  return (
    <div className={`twin-live-card ${danger ? "danger" : ""}`}>
      <span className="twin-live-icon">{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value} <em>{suffix}</em></strong>
      </div>
    </div>
  );
}

function BreakdownRow({ label, percent = 0, detail }) {
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <div className="breakdown-row">
      <div className="breakdown-top">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="breakdown-track">
        <div className="breakdown-fill" style={{ width: `${value}%` }} />
      </div>
      {detail && <small>{detail}</small>}
    </div>
  );
}
