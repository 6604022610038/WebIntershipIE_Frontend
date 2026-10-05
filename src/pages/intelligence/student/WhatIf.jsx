import { useEffect, useState } from "react";

import { api } from "../../../services/api";

import Card from "../../../components/Card";
import Badge from "../../../components/Badge";
import PageTitle from "../../../components/PageTitle";
import "../../../components/components.css";

import "../../student/student.css";
import "./whatif.css";

const RISK_LABEL = { low: "ปกติ", medium: "ควรติดตาม", high: "เร่งด่วน" };
const RISK_TONE = { low: "green", medium: "orange", high: "red" };

const PRESETS = [
  { label: "ส่งรายงานตรงเวลาทุกสัปดาห์ (อีก 4 สัปดาห์)", values: { extraReports: 4, daysAhead: 28, fixPending: true, evalScore: "" } },
  { label: "ไม่ทำอะไรเลย 2 สัปดาห์", values: { extraReports: 0, daysAhead: 14, fixPending: false, evalScore: "" } },
  { label: "แก้รายงานที่ค้างทั้งหมดวันนี้", values: { extraReports: 0, daysAhead: 0, fixPending: true, evalScore: "" } },
  { label: "ได้คะแนนประเมิน 5/5", values: { extraReports: 0, daysAhead: 0, fixPending: false, evalScore: 5 } },
];

const DEFAULTS = { extraReports: 2, daysAhead: 14, fixPending: false, evalScore: "" };

/**
 * 🔮 What-if Simulator
 * จำลองสถานการณ์สมมติ (ส่งรายงานเพิ่ม / ปล่อยเวลาผ่านไป / คะแนนประเมิน)
 * แล้วเทียบผลกับสถานะปัจจุบัน
 */
export default function WhatIf({ user }) {
  const studentId = user?.studentId || user?.username;

  const [form, setForm] = useState(DEFAULTS);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function simulate(values = form) {
    if (!studentId) return;
    setLoading(true);
    setError("");
    try {
      const body = { ...values, evalScore: values.evalScore === "" ? null : Number(values.evalScore) };
      const data = await api(`/intelligence/whatif/${studentId}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setResult(data);
    } catch (err) {
      setError(err.message || "ไม่สามารถจำลองสถานการณ์ได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    simulate(DEFAULTS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function applyPreset(values) {
    setForm(values);
    simulate(values);
  }

  const base = result?.baseline;
  const sim = result?.simulated;
  const delta = result?.delta;
  const proj = result?.projection;

  return (
    <div className="dashboard-page whatif-page">
      <PageTitle
        title="🔮 What-if Simulator"
        subtitle="ลองสมมติสถานการณ์ แล้วดูว่าความคืบหน้าและความเสี่ยงของคุณจะเปลี่ยนไปอย่างไร"
      />

      <div className="whatif-presets">
        {PRESETS.map((p) => (
          <button key={p.label} type="button" className="whatif-chip" disabled={loading} onClick={() => applyPreset(p.values)}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="whatif-grid">
        <Card title="⚙️ กำหนดสถานการณ์">
          <div className="whatif-form">
            <label>
              <span>ส่งรายงานประจำสัปดาห์เพิ่ม: <strong>{form.extraReports}</strong> ฉบับ</span>
              <input type="range" min="0" max="12" value={form.extraReports} onChange={(e) => update("extraReports", Number(e.target.value))} />
            </label>

            <label>
              <span>เวลาผ่านไป: <strong>{form.daysAhead}</strong> วัน</span>
              <input type="range" min="0" max="120" step="1" value={form.daysAhead} onChange={(e) => update("daysAhead", Number(e.target.value))} />
            </label>

            <label>
              <span>สมมติคะแนนประเมินล่าสุด</span>
              <select value={form.evalScore} onChange={(e) => update("evalScore", e.target.value)}>
                <option value="">ไม่เปลี่ยนแปลง</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} / 5</option>
                ))}
              </select>
            </label>

            <label className="whatif-check">
              <input type="checkbox" checked={form.fixPending} onChange={(e) => update("fixPending", e.target.checked)} />
              <span>แก้รายงานที่ "ต้องแก้ไข" ทั้งหมดให้เรียบร้อย</span>
            </label>

            <button type="button" className="whatif-run" disabled={loading} onClick={() => simulate()}>
              {loading ? "กำลังจำลอง..." : "จำลองสถานการณ์"}
            </button>
          </div>

          {error && <p style={{ color: "#e5484d", fontSize: 13, marginTop: 8 }}>{error}</p>}
        </Card>

        <Card title="📊 ผลการจำลอง">
          {!result ? (
            <p style={{ fontSize: 13, color: "#65748e" }}>กำลังคำนวณ...</p>
          ) : (
            <>
              <div className={`whatif-verdict ${result.verdict}`}>{result.verdictText}</div>

              <div className="whatif-compare">
                <Compare
                  label="ความคืบหน้ารวม"
                  before={`${base.percent}%`}
                  after={`${sim.percent}%`}
                  diff={delta.percent}
                  goodWhenUp
                  suffix="%"
                />
                <Compare
                  label="คะแนนความเสี่ยง"
                  before={`${base.riskScore}`}
                  after={`${sim.riskScore}`}
                  diff={delta.riskScore}
                  goodWhenUp={false}
                />
                <div className="whatif-risk-row">
                  <span>ระดับความเสี่ยง</span>
                  <span>
                    <Badge tone={RISK_TONE[base.riskLevel]}>{RISK_LABEL[base.riskLevel]}</Badge>
                    {" → "}
                    <Badge tone={RISK_TONE[sim.riskLevel]}>{RISK_LABEL[sim.riskLevel]}</Badge>
                  </span>
                </div>
              </div>

              {sim.reasons?.length > 0 && (
                <ul className="whatif-reasons">
                  {sim.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </Card>
      </div>

      {proj && (
        <Card title="🏁 คาดการณ์ ณ วันสิ้นสุดการฝึกงาน">
          <p className="whatif-proj-note">เหลืออีกประมาณ {proj.weeksLeft} สัปดาห์ — เทียบสองแนวทาง</p>
          <div className="whatif-proj">
            <div className="whatif-proj-box idle">
              <h4>ถ้าไม่ส่งรายงานเพิ่มเลย</h4>
              <strong>{proj.ifIdle.percent}%</strong>
              <Badge tone={RISK_TONE[proj.ifIdle.riskLevel]}>{RISK_LABEL[proj.ifIdle.riskLevel]}</Badge>
            </div>
            <div className="whatif-proj-box steady">
              <h4>ถ้าส่งทุกสัปดาห์จนจบ</h4>
              <strong>{proj.ifSteady.percent}%</strong>
              <Badge tone={RISK_TONE[proj.ifSteady.riskLevel]}>{RISK_LABEL[proj.ifSteady.riskLevel]}</Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function Compare({ label, before, after, diff, goodWhenUp, suffix = "" }) {
  const improved = goodWhenUp ? diff > 0 : diff < 0;
  const worse = goodWhenUp ? diff < 0 : diff > 0;
  const tone = diff === 0 ? "same" : improved ? "good" : worse ? "bad" : "same";
  const sign = diff > 0 ? "+" : "";
  return (
    <div className="whatif-compare-row">
      <span>{label}</span>
      <span className="whatif-compare-values">
        {before} → <strong>{after}</strong>
        <em className={`whatif-diff ${tone}`}>
          {sign}
          {diff}
          {suffix}
        </em>
      </span>
    </div>
  );
}
