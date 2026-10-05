import { useEffect, useMemo, useState } from "react";

import { api } from "../../../services/api";

import Card from "../../../components/Card";
import Badge from "../../../components/Badge";
import PageTitle from "../../../components/PageTitle";
import "../../../components/components.css";

import "../../advisor/advisor.css";
import "./anomalies.css";

const SEVERITY_LABEL = { high: "รุนแรง", medium: "ปานกลาง", low: "เล็กน้อย" };
const SEVERITY_TONE = { high: "red", medium: "orange", low: "blue" };

function fmtDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * 🕵️ Anomaly Detection
 * ตรวจจับพฤติกรรมหรือข้อมูลที่ผิดปกติในรายงาน/ผลประเมินของนักศึกษาทุกคน
 */
export default function Anomalies() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let ignore = false;
    api("/intelligence/anomalies")
      .then((r) => !ignore && setData(r))
      .catch((e) => !ignore && setError(e.message || "ไม่สามารถโหลดข้อมูลได้"))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.anomalies || []).filter(
      (a) =>
        (filter === "all" || a.severity === filter) &&
        (!q || `${a.studentName} ${a.studentId} ${a.title}`.toLowerCase().includes(q))
    );
  }, [data, filter, query]);

  if (loading) return <div className="loading-page">กำลังตรวจจับความผิดปกติ...</div>;

  if (error) {
    return (
      <div className="content">
        <PageTitle title="🕵️ Anomaly Detection" subtitle="ตรวจจับพฤติกรรมหรือข้อมูลที่ผิดปกติ" />
        <Card title="เกิดข้อผิดพลาด">
          <p style={{ color: "#e5484d", fontSize: 13 }}>{error}</p>
        </Card>
      </div>
    );
  }

  const by = data?.bySeverity || {};

  return (
    <div className="dashboard-page anomaly-page">
      <PageTitle
        title="🕵️ Anomaly Detection"
        subtitle="ตรวจจับพฤติกรรมหรือข้อมูลที่ผิดปกติในการส่งรายงานและผลประเมินของนักศึกษา"
      />

      <div className="anomaly-stats">
        <Stat label="พบความผิดปกติทั้งหมด" value={data?.total ?? 0} />
        <Stat label="นักศึกษาที่เกี่ยวข้อง" value={data?.studentsAffected ?? 0} />
        <Stat label="รุนแรง" value={by.high ?? 0} tone="red" />
        <Stat label="ปานกลาง" value={by.medium ?? 0} tone="orange" />
        <Stat label="เล็กน้อย" value={by.low ?? 0} tone="blue" />
      </div>

      <Card title="รายการความผิดปกติ">
        <div className="anomaly-toolbar">
          <div className="anomaly-filters">
            {[["all", "ทั้งหมด"], ["high", "รุนแรง"], ["medium", "ปานกลาง"], ["low", "เล็กน้อย"]].map(([key, label]) => (
              <button key={key} type="button" className={`anomaly-filter ${filter === key ? "active" : ""}`} onClick={() => setFilter(key)}>
                {label}
              </button>
            ))}
          </div>
          <input
            className="anomaly-search"
            placeholder="ค้นหาชื่อ / รหัสนักศึกษา / ประเภท"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {rows.length === 0 ? (
          <p style={{ fontSize: 13, color: "#65748e" }}>ไม่พบความผิดปกติตามเงื่อนไขที่เลือก 🎉</p>
        ) : (
          <div className="anomaly-list">
            {rows.map((a, i) => (
              <div className={`anomaly-item sev-${a.severity}`} key={`${a.studentId}-${a.type}-${i}`}>
                <div className="anomaly-item-head">
                  <strong>{a.title}</strong>
                  <Badge tone={SEVERITY_TONE[a.severity]}>{SEVERITY_LABEL[a.severity]}</Badge>
                </div>
                <p className="anomaly-student">
                  {a.studentName || "-"} ({a.studentId})
                  {a.date ? ` • ${fmtDate(a.date)}` : ""}
                </p>
                <p className="anomaly-detail">{a.detail}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className={`anomaly-stat ${tone || ""}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
