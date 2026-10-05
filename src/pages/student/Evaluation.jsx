import Card from "../../components/Card";
import PageTitle from "../../components/PageTitle";
import Empty from "../../components/Empty";
import { fmt, fmtLong } from "../../utils/format";
import "./student.css";

const SKILLS = [
  ["ความรู้ความเข้าใจ", "knowledge", "📘"],
  ["ประสิทธิภาพการทำงาน", "performance", "⚙️"],
  ["การแก้ปัญหา", "problemSolving", "🧩"],
  ["การทำงานเป็นทีม", "teamwork", "🤝"],
  ["ความรับผิดชอบและจริยธรรม", "ethics", "🛡️"],
];

const RADIUS = 57;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function tier(value) {
  if (value >= 80) return "good";
  if (value >= 60) return "ok";
  if (value >= 40) return "warn";
  return "low";
}

export default function Evaluation({
  evaluations = [],
}) {
  const list = Array.isArray(evaluations) ? evaluations : [];
  const e = list[0];
  const history = list.slice(1);

  return (
    <div className="content narrow">
      <PageTitle
        title="ผลการประเมิน"
        subtitle="ผลประเมินการฝึกงานจากอาจารย์ที่ปรึกษา"
      />

      <Card
        title="คะแนนประเมินล่าสุด"
        className="eval-summary-card"
      >
        {!e ? (
          <Empty text="ยังไม่มีผลการประเมินจากอาจารย์ที่ปรึกษา" />
        ) : (
          <>
            <EvalHero evaluation={e} />

            <div className="eval-divider" />

            <div className="eval-skills">
              {SKILLS.map(([label, key, icon]) => {
                const value = Math.max(
                  0,
                  Math.min(100, Number(e?.skills?.[key] || 0))
                );
                const t = tier(value);

                return (
                  <div className="eval-skill-row" key={key}>
                    <span className="eval-skill-icon">
                      {icon}
                    </span>

                    <span className="eval-skill-label">
                      {label}
                    </span>

                    <div className="eval-skill-bar">
                      <i
                        className={`eval-skill-fill ${t}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>

                    <b className={`eval-skill-value ${t}`}>
                      {value}%
                    </b>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {history.length > 0 && (
        <Card title="ประวัติการประเมินก่อนหน้า">
          <div className="eval-history">
            {history.map((h) => (
              <div
                className="eval-history-row"
                key={h._id || h.createdAt}
              >
                <div className="eval-history-score">
                  {Number(h.score || 0).toFixed(1)}
                  <small>/5</small>
                </div>

                <div className="eval-history-body">
                  <p>
                    {h.comment || "ไม่มีความคิดเห็นเพิ่มเติม"}
                  </p>

                  <span>
                    {fmt(h.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function EvalHero({ evaluation: e }) {
  const score = Number(e?.score || 0);
  const pct = Math.max(0, Math.min(100, (score / 5) * 100));
  const offset = CIRCUMFERENCE * (1 - pct / 100);
  const filledStars = Math.round(score);

  return (
    <div className="eval-hero">
      <div className="eval-ring">
        <svg viewBox="0 0 132 132">
          <circle
            cx="66"
            cy="66"
            r={RADIUS}
            className="eval-ring-bg"
          />

          <circle
            cx="66"
            cy="66"
            r={RADIUS}
            className="eval-ring-fill"
            style={{
              strokeDasharray: CIRCUMFERENCE,
              strokeDashoffset: offset,
            }}
          />
        </svg>

        <div className="eval-ring-text">
          <strong>
            {score.toFixed(1)}
          </strong>

          <span>
            จาก 5
          </span>
        </div>
      </div>

      <div className="eval-hero-body">
        <div
          className="eval-stars"
          aria-label={`ให้คะแนน ${score.toFixed(1)} จาก 5 ดาว`}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={
                n <= filledStars
                  ? "eval-star filled"
                  : "eval-star"
              }
            >
              ★
            </span>
          ))}
        </div>

        <p className="eval-comment">
          {e?.comment ||
            "ยังไม่มีความคิดเห็นเพิ่มเติมจากอาจารย์ที่ปรึกษา"}
        </p>

        <span className="eval-date">
          🗓 {fmtLong(e?.createdAt)}
        </span>
      </div>
    </div>
  );
}