import { useCallback, useEffect, useRef, useState } from "react";

import { api } from "../../services/api";

import Card from "../../components/Card";
import Badge from "../../components/Badge";
import PageTitle from "../../components/PageTitle";
import "../../components/components.css";

import "../advisor/advisor.css";
import "./qacenter.css";

const STATUS_TONE = { PASS: "green", FAIL: "red", SKIP: "orange" };

function fmtDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
}

/**
 * 🤖 Robot Framework QA Center
 * แสดงผลทดสอบอัตโนมัติ (PASS/FAIL) จาก Robot Framework และสั่งรันชุดทดสอบได้
 */
export default function QACenter() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const timerRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const result = await api("/qa/results");
      setData(result);
      setError("");
      return result;
    } catch (err) {
      setError(err.message || "ไม่สามารถโหลดผลการทดสอบได้");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    return () => clearInterval(timerRef.current);
  }, [load]);

  // ระหว่างรัน ให้ poll ผลทุก 3 วินาทีจนเสร็จ
  useEffect(() => {
    clearInterval(timerRef.current);
    if (data?.run?.running) {
      timerRef.current = setInterval(load, 3000);
    }
    return () => clearInterval(timerRef.current);
  }, [data?.run?.running, load]);

  async function runTests() {
    setStarting(true);
    setError("");
    try {
      await api("/qa/run", { method: "POST" });
      await load();
    } catch (err) {
      setError(err.message || "ไม่สามารถเริ่มรันการทดสอบได้");
    } finally {
      setStarting(false);
    }
  }

  if (loading) return <div className="loading-page">กำลังโหลดผลการทดสอบ...</div>;

  const running = !!data?.run?.running;
  const totals = data?.totals || { total: 0, pass: 0, fail: 0, skip: 0 };
  const allGreen = data?.available && totals.total > 0 && totals.fail === 0;

  return (
    <div className="dashboard-page qa-page">
      <PageTitle
        title="🤖 Robot Framework QA Center"
        subtitle="ทดสอบระบบอัตโนมัติและแสดงผล PASS / FAIL"
        action={
          <button type="button" className="qa-run-btn" disabled={running || starting} onClick={runTests}>
            {running ? "กำลังรันการทดสอบ..." : "▶ Run tests"}
          </button>
        }
      />

      {error && <p className="qa-error">{error}</p>}
      {data?.run?.error && <p className="qa-error">{data.run.error}</p>}

      {!data?.available ? (
        <Card title="ยังไม่มีผลการทดสอบ">
          <p className="qa-empty">
            ยังไม่พบไฟล์ผลการทดสอบ (qa/results/output.xml) — กดปุ่ม <strong>Run tests</strong> เพื่อรันชุดทดสอบ
            หรือรันเองด้วย <code>qa/run_tests.sh</code> (ต้องติดตั้ง Robot Framework ก่อน:{" "}
            <code>pip install -r qa/requirements.txt</code>)
          </p>
        </Card>
      ) : (
        <>
          <div className={`qa-banner ${allGreen ? "pass" : "fail"}`}>
            <strong>{allGreen ? "✅ ผ่านทั้งหมด" : `❌ ไม่ผ่าน ${totals.fail} รายการ`}</strong>
            <span>รันล่าสุด: {fmtDateTime(data.generatedAt)}</span>
          </div>

          <div className="qa-stats">
            <Stat label="ทั้งหมด" value={totals.total} />
            <Stat label="PASS" value={totals.pass} tone="green" />
            <Stat label="FAIL" value={totals.fail} tone="red" />
            <Stat label="SKIP" value={totals.skip} tone="orange" />
            <Stat label="อัตราผ่าน" value={`${data.passRate}%`} />
          </div>

          <div className="qa-filters">
            {["ALL", "PASS", "FAIL", "SKIP"].map((s) => (
              <button
                key={s}
                type="button"
                className={`qa-filter ${statusFilter === s ? "active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === "ALL" ? "ทั้งหมด" : s}
              </button>
            ))}
          </div>

          {data.suites.map((suite) => {
            const tests = suite.tests.filter((t) => statusFilter === "ALL" || t.status === statusFilter);
            if (!tests.length) return null;
            const failed = suite.tests.filter((t) => t.status === "FAIL").length;
            return (
              <Card
                key={suite.name}
                title={`📁 ${suite.name}`}
                action={<Badge tone={failed ? "red" : "green"}>{failed ? `FAIL ${failed}` : "PASS"}</Badge>}
              >
                <div className="qa-test-list">
                  {tests.map((t) => (
                    <div className={`qa-test ${t.status.toLowerCase()}`} key={t.name}>
                      <div className="qa-test-head">
                        <span>{t.name}</span>
                        <span className="qa-test-meta">
                          {t.elapsed != null ? `${t.elapsed}s` : ""}
                          <Badge tone={STATUS_TONE[t.status] || "blue"}>{t.status}</Badge>
                        </span>
                      </div>
                      {t.message && <pre className="qa-test-message">{t.message}</pre>}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className={`qa-stat ${tone || ""}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
