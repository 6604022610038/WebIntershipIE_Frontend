import { useEffect, useState } from "react";

import Card from "../../components/Card";
import PageTitle from "../../components/PageTitle";
import Empty from "../../components/Empty";
import { api } from "../../services/api";
import { fmtLong } from "../../utils/format";

import "./student.css";

const TONE = { "สำคัญ": "red", "กำหนดการ": "orange", "ทั่วไป": "blue" };

export default function Announcements({ announcements = [] }) {
  const [list, setList] = useState(announcements);
  const [filter, setFilter] = useState("ทั้งหมด");

  // ดึงประกาศทั้งหมด (หน้าหลักได้มาเพียง 5 รายการล่าสุด)
  useEffect(() => {
    let ignore = false;
    api("/announcements")
      .then((rows) => {
        if (!ignore && Array.isArray(rows)) setList(rows);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  const types = ["ทั้งหมด", "สำคัญ", "กำหนดการ", "ทั่วไป"];
  const shown = filter === "ทั้งหมด" ? list : list.filter((n) => (n.type || "ทั่วไป") === filter);

  return (
    <div className="content narrow">
      <PageTitle
        title="ประกาศ"
        subtitle="ข่าวสารและกำหนดการจากอาจารย์ที่ปรึกษา"
      />

      <div className="ann-filters" role="tablist" aria-label="กรองประเภทประกาศ">
        {types.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={filter === t}
            className={filter === t ? "active" : ""}
            onClick={() => setFilter(t)}
          >
            {t}
            <span>{t === "ทั้งหมด" ? list.length : list.filter((n) => (n.type || "ทั่วไป") === t).length}</span>
          </button>
        ))}
      </div>

      <Card title="ประกาศล่าสุด">
        <div className="ann-list">
          {shown.length ? (
            shown.map((n) => (
              <article key={n._id} className={`ann-item ${TONE[n.type] || "blue"}`}>
                <div className="ann-head">
                  <span className={`badge ${TONE[n.type] || "blue"}`}>{n.type || "ทั่วไป"}</span>
                  <small>{fmtLong(n.publishDate || n.createdAt)}</small>
                </div>
                <h4>{n.title}</h4>
                <p>{n.content}</p>
                {n.createdBy && <small className="ann-by">โดย {n.createdBy}</small>}
              </article>
            ))
          ) : (
            <Empty text="ยังไม่มีประกาศในหมวดนี้" />
          )}
        </div>
      </Card>
    </div>
  );
}
