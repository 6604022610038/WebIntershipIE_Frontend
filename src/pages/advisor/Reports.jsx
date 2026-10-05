import { useMemo, useState } from "react";

import Card from "../../components/Card";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";
import PageTitle from "../../components/PageTitle";

import { api } from "../../services/api";

import "./advisor.css";



export default function AdvisorReports({
  data,
  refresh,
}) {
  const [selected, setSelected] =
    useState(null);

  const [comment, setComment] =
    useState('');

  const [search, setSearch] =
    useState('');

  const reports =
    data.weeklyReports || [];

  const students =
    data.students || [];

  function studentNameOf(
    studentId
  ) {
    return (
      students.find(
        (s) =>
          s.studentId ===
          studentId
      )?.name || ''
    );
  }

  const filteredReports =
    useMemo(() => {
      const text = search
        .trim()
        .toLowerCase();

      if (!text) {
        return reports;
      }

      return reports.filter(
        (r) =>
          String(
            studentNameOf(
              r.studentId
            )
          )
            .toLowerCase()
            .includes(text) ||
          String(
            r.studentId || ''
          )
            .toLowerCase()
            .includes(text) ||
          String(
            r.weekNumber ?? ''
          )
            .toLowerCase()
            .includes(text) ||
          String(
            r.workTitle || ''
          )
            .toLowerCase()
            .includes(text) ||
          String(
            r.status || ''
          )
            .toLowerCase()
            .includes(text)
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reports, students, search]);

  async function reviewWeekly(
    id,
    approved
  ) {
    try {
      await api(
        `/weekly-reports/${id}/${
          approved
            ? 'approve'
            : 'reject'
        }`,
        {
          method: 'PUT',
          body: JSON.stringify({
            advisorComment:
              comment,
          }),
        }
      );

      setSelected(null);
      setComment('');

      refresh();
    } catch (e) {
      alert(e.message);
    }
  }

  function studentName(
    studentId
  ) {
    return (
      students.find(
        (s) =>
          s.studentId ===
          studentId
      )?.name ||
      studentId
    );
  }

  return (
    <div className="content">
      <PageTitle
        title="ตรวจสอบรายงานนักศึกษา"
        subtitle="ตรวจรายงานประจำสัปดาห์ พร้อมส่งผลการตรวจให้นักศึกษา"
      />

      <Card
        title={`รายงานประจำสัปดาห์ทั้งหมด ${reports.length} ฉบับ`}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="ค้นหาชื่อนักศึกษา รหัสนักศึกษา สัปดาห์ หัวข้องาน หรือสถานะ..."
            style={{
              flex: 1,
              height: 38,
              border:
                "1px solid #dce5f3",
              borderRadius: 8,
              padding:
                "0 12px",
              outline: "none",
              color:
                "#38527d",
            }}
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  นักศึกษา
                </th>

                <th>
                  สัปดาห์
                </th>

                <th>
                  หัวข้องาน
                </th>

                <th>
                  วันที่ส่ง
                </th>

                <th>
                  สถานะ
                </th>

                <th>
                  จัดการ
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredReports.map(
                (r) => (
                  <tr
                    key={r._id}
                  >
                    <td>
                      {studentName(
                        r.studentId
                      )}
                    </td>

                    <td>
                      สัปดาห์ที่{' '}
                      {r.weekNumber}
                    </td>

                    <td>
                      {r.workTitle}
                    </td>

                    <td>
                      {fmt(
                        r.createdAt
                      )}
                    </td>

                    <td>
                      <Badge
                        tone={
                          r.status ===
                          'อาจารย์ตรวจแล้ว'
                            ? 'green'
                            : r.status ===
                              'ต้องแก้ไข'
                            ? 'red'
                            : 'orange'
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>

                    <td>
                      <button
                        className="small-btn"
                        onClick={() => {
                          setSelected(
                            r
                          );

                          setComment(
                            r.advisorComment ||
                              ''
                          );
                        }}
                      >
                        ตรวจรายงาน
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {!filteredReports.length && (
            <Empty
              text={
                reports.length
                  ? "ไม่พบรายงานที่ค้นหา"
                  : "ยังไม่มีรายงานประจำสัปดาห์"
              }
            />
          )}
        </div>
      </Card>

      {selected && (
        <Modal
          title={`ตรวจรายงานสัปดาห์ที่ ${selected.weekNumber}`}
          onClose={() => {
            setSelected(null);
            setComment('');
          }}
        >
          <div className="report-preview">
            <b>
              {selected.workTitle}
            </b>

            <p>
              {selected.workDescription}
            </p>

            <div>
              <b>
                ปัญหา:
              </b>{' '}
              {selected.problems ||
                '-'}
            </div>

            <div>
              <b>
                วิธีแก้ไข:
              </b>{' '}
              {selected.solution ||
                '-'}
            </div>
          </div>

          <label>
            ความคิดเห็นอาจารย์

            <textarea
              rows="4"
              value={comment}
              onChange={(e) =>
                setComment(
                  e.target.value
                )
              }
              placeholder="พิมพ์ข้อเสนอแนะ..."
            />
          </label>

          <div className="review-actions">
            <button
              className="secondary"
              onClick={() =>
                reviewWeekly(
                  selected._id,
                  false
                )
              }
            >
              ส่งกลับแก้ไข
            </button>

            <button
              className="primary"
              onClick={() =>
                reviewWeekly(
                  selected._id,
                  true
                )
              }
            >
              ✓ อนุมัติรายงาน
            </button>
          </div>
        </Modal>
      )}
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


// ==============================
// LONG DATE FORMAT
// ==============================

function fmtLong(date) {
  if (!date) {
    return "-";
  }

  try {
    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "-";
    }

    return d.toLocaleDateString("th-TH", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    return "-";
  }
}