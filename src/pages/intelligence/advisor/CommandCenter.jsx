import { useEffect, useMemo, useState } from "react";

import { api } from "../../../services/api";

import Card from "../../../components/Card";
import Badge from "../../../components/Badge";
import PageTitle from "../../../components/PageTitle";
import Modal from "../../../components/Modal";
import ProgressRing from "../../../components/ProgressRing";
import JourneyTimeline from "../../../components/JourneyTimeline";
import "../../../components/components.css";

import "../../advisor/advisor.css";
import "./commandcenter.css";

const RISK_LABEL = {
  low: "ปกติ",
  medium: "ควรติดตาม",
  high: "เร่งด่วน",
};

const RISK_TONE = {
  low: "green",
  medium: "orange",
  high: "red",
};

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Advisor Command Center
 * ข้อมูลมาจาก /api/intelligence/advisor-overview และ refresh อัตโนมัติทุก 30 วินาที
 */
export default function CommandCenter({ setPage }) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  async function load({ silent = false } = {}) {
    if (silent) setRefreshing(true);
    else setLoading(true);

    setError("");
    try {
      const result = await api("/intelligence/advisor-overview");
      setOverview(result);
    } catch (err) {
      setError(err.message || "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const timer = window.setInterval(() => load({ silent: true }), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const roster = overview?.roster || [];

  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();

    return roster.filter((r) => {
      const matchRisk = filter === "all" || r.risk.level === filter;
      const matchText =
        !text ||
        String(r.name || "").toLowerCase().includes(text) ||
        String(r.studentId || "").toLowerCase().includes(text) ||
        String(r.company || "").toLowerCase().includes(text) ||
        String(r.major || "").toLowerCase().includes(text);

      return matchRisk && matchText;
    });
  }, [roster, filter, search]);

  if (loading && !overview) {
    return <div className="loading-page">กำลังวิเคราะห์ข้อมูลนักศึกษาทั้งหมด...</div>;
  }

  return (
    <div className="content command-center-page">
      <PageTitle
        title="👨‍🏫 Advisor Command Center"
        subtitle="ศูนย์ควบคุมการฝึกงานจากข้อมูลจริง: ความคืบหน้า รายงาน ผลประเมิน ชั่วโมง และความเสี่ยง"
        action={
          <button
            className="cc-refresh-btn"
            onClick={() => load({ silent: true })}
            disabled={refreshing}
          >
            {refreshing ? "กำลังอัปเดต..." : "↻ อัปเดตข้อมูล"}
          </button>
        }
      />

      {error && (
        <Card title="เชื่อมต่อข้อมูลไม่สำเร็จ">
          <p className="cc-error">{error}</p>
          <button className="small-btn" onClick={() => load()}>
            ลองใหม่
          </button>
        </Card>
      )}

      <div className="cc-live-status">
        <span className="live-dot" />
        <span>ข้อมูลจากฐานข้อมูลจริง</span>
        <span>•</span>
        <span>อัปเดตล่าสุด {formatDate(overview?.generatedAt)}</span>
        <span>•</span>
        <span>ระบบรีเฟรชทุก 30 วินาที</span>
      </div>

      <div className="cc-stat-grid">
        <StatBlock icon="👥" title="นักศึกษาทั้งหมด" value={overview?.totalStudents ?? 0} suffix="คน" tone="purple" />
        <StatBlock icon="📊" title="ความคืบหน้าเฉลี่ย" value={overview?.avgProgress ?? 0} suffix="%" tone="blue" />
        <StatBlock
          icon="📝"
          title="รายงานรอตรวจ"
          value={overview?.reports?.pending ?? 0}
          suffix="ฉบับ"
          tone="orange"
          onClick={() => {
            setFilter("all");
            setPage?.("advisor-reports");
          }}
        />
        <StatBlock
          icon="🛠️"
          title="รายงานต้องแก้ไข"
          value={overview?.reports?.needFix ?? 0}
          suffix="ฉบับ"
          tone="red"
          onClick={() => setPage?.("advisor-reports")}
        />
        <StatBlock
          icon="🚦"
          title="ควรติดตาม"
          value={overview?.distribution?.medium ?? 0}
          suffix="คน"
          tone="orange"
          onClick={() => setFilter("medium")}
        />
        <StatBlock
          icon="🔥"
          title="เร่งด่วน"
          value={overview?.distribution?.high ?? 0}
          suffix="คน"
          tone="red"
          onClick={() => setFilter("high")}
        />
      </div>

      <div className="cc-kpi-grid">
        <Card title="⏱️ ชั่วโมงฝึกงานรวม">
          <div className="cc-big-kpi">
            {overview?.hours?.completed ?? 0}
            <small> / {overview?.hours?.required ?? 0} ชั่วโมง</small>
          </div>
          <div className="cc-kpi-track">
            <i style={{ width: `${overview?.hours?.percent ?? 0}%` }} />
          </div>
          <span className="cc-kpi-note">
            {overview?.hours?.percent == null ? "ยังไม่ได้กำหนดชั่วโมงเป้าหมาย" : `${overview.hours.percent}% ของชั่วโมงเป้าหมาย`}
          </span>
        </Card>

        <Card title="⭐ คะแนนประเมินเฉลี่ย">
          <div className="cc-big-kpi">
            {overview?.avgEvaluation ?? "-"}
            <small>{overview?.avgEvaluation != null ? " / 5" : " ยังไม่มีข้อมูล"}</small>
          </div>
          <span className="cc-kpi-note">คำนวณจากผลประเมินที่บันทึกในระบบทั้งหมด</span>
        </Card>
      </div>

      <div className="cc-grid">
        <Card
          title="🚦 Risk Monitor — นักศึกษาที่ต้องติดตาม"
          action={
            filter !== "all" && (
              <button className="text-btn" onClick={() => setFilter("all")}>
                ล้างตัวกรอง ✕
              </button>
            )
          }
        >
          {overview?.attentionList?.length ? (
            <div className="cc-attention-list">
              {overview.attentionList.map((r) => (
                <button
                  type="button"
                  className="cc-attention-item"
                  key={r.studentId}
                  onClick={() => setSelectedId(r.studentId)}
                >
                  <div className="avatar tiny">{(r.name || "น").charAt(0)}</div>
                  <div className="cc-attention-info">
                    <strong>{r.name || r.studentId}</strong>
                    <span>
                      {r.company || "-"} • ความคืบหน้า {r.progress.percent}% •
                      รายงานต้องแก้ {r.reports?.needFix ?? 0} ฉบับ
                    </span>
                  </div>
                  <Badge tone={RISK_TONE[r.risk.level]}>
                    {RISK_LABEL[r.risk.level]} ({r.risk.score})
                  </Badge>
                </button>
              ))}
            </div>
          ) : (
            <div className="cc-empty">🎉 ไม่มีนักศึกษาที่ต้องติดตามเป็นพิเศษในขณะนี้</div>
          )}
        </Card>

        <Card title="ภาพรวมระดับความเสี่ยง">
          <DistributionBar
            distribution={overview?.distribution}
            total={overview?.totalStudents}
          />
          <div className="cc-risk-actions">
            <button className="small-btn" onClick={() => setFilter("high")}>
              ดูเร่งด่วน
            </button>
            <button className="small-btn" onClick={() => setFilter("medium")}>
              ดูควรติดตาม
            </button>
            <button className="small-btn" onClick={() => setPage?.("advisor-students")}>
              ดูรายชื่อนักศึกษา
            </button>
          </div>
        </Card>
      </div>

      <Card
        title={`รายชื่อนักศึกษาทั้งหมด (${filtered.length}/${roster.length})`}
        action={
          <input
            className="cc-search"
            placeholder="ค้นหาชื่อ, รหัส, สาขา, บริษัท..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
      >
        <div className="cc-filter-row">
          {["all", "high", "medium", "low"].map((key) => (
            <button
              key={key}
              className={`cc-filter-chip ${filter === key ? "active" : ""}`}
              onClick={() => setFilter(key)}
            >
              {key === "all" ? "ทั้งหมด" : RISK_LABEL[key]}
            </button>
          ))}
        </div>

        <div className="cc-roster-table">
          <div className="cc-roster-head">
            <span>นักศึกษา</span>
            <span>สถานประกอบการ</span>
            <span>Progress</span>
            <span>รายงาน</span>
            <span>ความเสี่ยง</span>
          </div>

          {filtered.map((r) => (
            <button
              type="button"
              className="cc-roster-row"
              key={r.studentId}
              onClick={() => setSelectedId(r.studentId)}
            >
              <span className="person-cell">
                <div className="avatar tiny">{(r.name || "น").charAt(0)}</div>
                <span>
                  <strong>{r.name || r.studentId}</strong>
                  <small>{r.studentId}</small>
                </span>
              </span>

              <span>
                <strong>{r.company || "-"}</strong>
                <small>{r.position || r.major || "-"}</small>
              </span>

              <span>
                <div className="progress-cell">
                  <div className="bar">
                    <i style={{ width: `${r.progress.percent}%` }} />
                  </div>
                  <small>{r.progress.percent}%</small>
                </div>
              </span>

              <span className="cc-report-mini">
                <small>ส่ง {r.reports?.submitted ?? 0}</small>
                <small>ผ่าน {r.reports?.approved ?? 0}</small>
                <small className={r.reports?.needFix ? "danger-text" : ""}>
                  แก้ {r.reports?.needFix ?? 0}
                </small>
              </span>

              <Badge tone={RISK_TONE[r.risk.level]}>
                {RISK_LABEL[r.risk.level]}
              </Badge>
            </button>
          ))}

          {!filtered.length && (
            <div className="cc-empty">ไม่พบนักศึกษาที่ตรงกับเงื่อนไข</div>
          )}
        </div>
      </Card>

      {selectedId && (
        <StudentTwinModal
          studentId={selectedId}
          onClose={() => setSelectedId(null)}
          onNavigate={setPage}
        />
      )}
    </div>
  );
}

function StudentTwinModal({ studentId, onClose, onNavigate }) {
  const [twin, setTwin] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    setTwin(null);
    setError("");

    api(`/intelligence/student/${studentId}`)
      .then((r) => !ignore && setTwin(r))
      .catch((err) => !ignore && setError(err.message || "ไม่สามารถโหลดข้อมูลได้"));

    return () => {
      ignore = true;
    };
  }, [studentId]);

  return (
    <Modal title={twin?.student?.name || "Digital Twin"} icon="👨‍🎓" onClose={onClose}>
      {error && <p className="cc-error">{error}</p>}
      {!twin && !error && <p className="cc-loading-text">กำลังโหลดข้อมูลนักศึกษา...</p>}

      {twin && (
        <div className="cc-modal-body">
          <div className="cc-modal-top">
            <ProgressRing
              percent={twin.progress?.percent || 0}
              size={90}
              strokeWidth={9}
              label="ความคืบหน้า"
            />

            <div>
              <h3 className="cc-modal-name">{twin.student?.name || "-"}</h3>
              <p className="cc-modal-meta">
                {twin.student?.studentId || studentId} • {twin.student?.major || "-"}
              </p>
              <p className="cc-modal-meta">
                {twin.student?.company || "-"} • {twin.student?.position || "-"}
              </p>
              <Badge tone={RISK_TONE[twin.risk?.level] || "blue"}>
                {RISK_LABEL[twin.risk?.level] || "-"} ({twin.risk?.score ?? 0}/100)
              </Badge>
            </div>
          </div>

          {twin.insight && <p className="cc-modal-insight">🧠 {twin.insight}</p>}

          <div className="cc-modal-kpis">
            <div><strong>{twin.stats?.hours?.completed ?? 0}</strong><span>ชั่วโมง</span></div>
            <div><strong>{twin.stats?.weeklyReportCount ?? 0}</strong><span>รายงาน</span></div>
            <div><strong>{twin.stats?.averageEvaluation ?? "-"}</strong><span>คะแนนเฉลี่ย</span></div>
            <div><strong>{twin.stats?.reportStatus?.needFix ?? 0}</strong><span>ต้องแก้</span></div>
          </div>

          {twin.risk?.reasons?.length > 0 && (
            <div className="cc-modal-section">
              <h4>⚠️ เหตุผลที่ระบบแจ้งเตือน</h4>
              <ul className="risk-reason-list">
                {twin.risk.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          <div className="cc-modal-section">
            <h4>📝 สถานะรายงาน</h4>
            <div className="cc-status-grid">
              <span>ร่าง <b>{twin.stats?.reportStatus?.draft ?? 0}</b></span>
              <span>รอตรวจ <b>{twin.stats?.reportStatus?.submitted ?? 0}</b></span>
              <span>ผ่าน <b>{twin.stats?.reportStatus?.approved ?? 0}</b></span>
              <span>ต้องแก้ <b>{twin.stats?.reportStatus?.needFix ?? 0}</b></span>
            </div>
          </div>

          <div className="cc-modal-section">
            <h4>🗺️ Internship Journey</h4>
            <div className="cc-modal-journey">
              <JourneyTimeline events={twin.journey || []} compact />
            </div>
          </div>

          <div className="cc-modal-actions">
            <button className="small-btn" onClick={() => onNavigate?.("advisor-reports")}>
              ตรวจรายงาน
            </button>
            <button className="small-btn" onClick={() => onNavigate?.("advisor-evaluations")}>
              ดูผลประเมิน
            </button>
            <button className="small-btn" onClick={() => onNavigate?.("advisor-students")}>
              ดูข้อมูลนักศึกษา
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function StatBlock({ icon, title, value, suffix, tone = "blue", onClick }) {
  const tones = {
    purple: { background: "#f0eaff", color: "#7654d6" },
    green: { background: "#e5f8f0", color: "#20a978" },
    orange: { background: "#fff1dc", color: "#e69a22" },
    blue: { background: "#e8f1ff", color: "#3474dc" },
    red: { background: "#fdeaea", color: "#e5484d" },
  };
  const selected = tones[tone] || tones.blue;

  return (
    <button
      type="button"
      className="stat-card cc-stat-button"
      onClick={onClick}
      disabled={!onClick}
    >
      <div className="stat-icon" style={{ background: selected.background, color: selected.color }}>
        {icon}
      </div>
      <div className="stat-info">
        <span>{title}</span>
        <strong>
          {value ?? 0}
          {suffix && <small> {suffix}</small>}
        </strong>
      </div>
    </button>
  );
}

function DistributionBar({ distribution, total }) {
  const d = distribution || { high: 0, medium: 0, low: 0 };
  const t = total || d.high + d.medium + d.low || 1;

  const segments = [
    { key: "high", label: "เร่งด่วน", value: d.high },
    { key: "medium", label: "ควรติดตาม", value: d.medium },
    { key: "low", label: "ปกติ", value: d.low },
  ];

  return (
    <div>
      <div className="cc-distribution-bar">
        {segments.map((s) => (
          <div
            key={s.key}
            className={`cc-segment cc-segment-${s.key}`}
            style={{ width: `${(s.value / t) * 100}%` }}
            title={`${s.label}: ${s.value}`}
          />
        ))}
      </div>

      <div className="cc-distribution-legend">
        {segments.map((s) => (
          <div key={s.key}>
            <span className={`dot cc-dot-${s.key}`} />
            {s.label}: <strong>{s.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
