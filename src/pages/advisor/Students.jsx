import { useMemo, useState } from "react";

import Card from "../../components/Card";
import Badge from "../../components/Badge";
import PageTitle from "../../components/PageTitle";
import Modal from "../../components/Modal";

import { api } from "../../services/api";

import "./advisor.css";


export default function AdvisorStudents({
  data,
}) {

  const students =
    data?.students || [];

  const reports =
    data?.weeklyReports || [];

  const [search, setSearch] =
    useState("");

  const [selected, setSelected] =
    useState(null);


  const filtered =
    useMemo(() => {

      const text =
        search
          .trim()
          .toLowerCase();

      if (!text) {
        return students;
      }

      return students.filter(
        (student) =>
          String(
            student.name || ""
          )
            .toLowerCase()
            .includes(text) ||

          String(
            student.studentId || ""
          )
            .toLowerCase()
            .includes(text) ||

          String(
            student.major || ""
          )
            .toLowerCase()
            .includes(text) ||

          String(
            student.company || ""
          )
            .toLowerCase()
            .includes(text)
      );

    }, [students, search]);


  function reportCount(studentId) {

    return reports.filter(
      (report) =>
        report.studentId ===
        studentId
    ).length;

  }


  function statusTone(status) {

    if (
      status === "กำลังฝึกงาน"
    ) {
      return "green";
    }

    if (
      status === "เสร็จสิ้น"
    ) {
      return "blue";
    }

    return "orange";

  }


  return (
    <div className="content">

      <PageTitle
        title="รายชื่อนักศึกษา"
        subtitle="รายชื่อนักศึกษาที่อยู่ในความดูแลของอาจารย์"
      />


      <Card>

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
            placeholder="ค้นหาชื่อ รหัสนักศึกษา สาขา หรือสถานประกอบการ..."
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding:
                "0 12px",
              border:
                "1px solid #dce5f3",
              borderRadius: 8,
              color:
                "#607495",
              fontSize: 12,
            }}
          >
            ทั้งหมด{" "}
            <b
              style={{
                marginLeft: 5,
                color:
                  "#245fd4",
              }}
            >
              {filtered.length}
            </b>
            คน
          </div>

        </div>


        <div className="table-wrap">

          <table>

            <thead>

              <tr>

                <th>ลำดับ</th>

                <th>
                  นักศึกษา
                </th>

                <th>
                  รหัสนักศึกษา
                </th>

                <th>
                  สาขา
                </th>

                <th>
                  สถานประกอบการ
                </th>

                <th>
                  ความคืบหน้า
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

              {filtered.map(
                (student, index) => (

                  <tr
                    key={
                      student._id ||
                      student.studentId
                    }
                  >

                    <td>
                      {index + 1}
                    </td>


                    <td>

                      <div className="person-cell">

                        <div className="avatar tiny">
                          {student.name
                            ?.charAt(0) ||
                            "น"}
                        </div>

                        <div>
                          <b>
                            {student.name ||
                              "-"}
                          </b>

                          <small
                            style={{
                              display:
                                "block",
                              color:
                                "#9aa8bc",
                            }}
                          >
                            รายงาน{" "}
                            {reportCount(
                              student.studentId
                            )}{" "}
                            ฉบับ
                          </small>
                        </div>

                      </div>

                    </td>


                    <td>
                      {student.studentId}
                    </td>


                    <td>
                      {student.major ||
                        "-"}
                    </td>


                    <td>
                      {student.company ||
                        "-"}
                    </td>


                    <td>

                      <div
                        style={{
                          minWidth: 90,
                        }}
                      >

                        <div className="bar">

                          <i
                            style={{
                              width:
                                `${Math.min(
                                  100,
                                  Number(
                                    student.progress ||
                                      0
                                  )
                                )}%`,
                            }}
                          />

                        </div>

                        <small>
                          {student.progress ||
                            0}
                          %
                        </small>

                      </div>

                    </td>


                    <td>

                      <Badge
                        tone={statusTone(
                          student.status
                        )}
                      >
                        {student.status ||
                          "ไม่ระบุ"}
                      </Badge>

                    </td>


                    <td>

                      <button
                        className="small-btn"
                        onClick={() =>
                          setSelected(
                            student
                          )
                        }
                      >
                        ดูข้อมูล
                      </button>

                    </td>

                  </tr>

                )
              )}


              {!filtered.length && (

                <tr>

                  <td
                    colSpan="8"
                    style={{
                      textAlign:
                        "center",
                      padding:
                        30,
                      color:
                        "#8a99b0",
                    }}
                  >
                    ไม่พบข้อมูลนักศึกษา
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </Card>


      {selected && (

        <Modal
          title="ข้อมูลนักศึกษา"
          onClose={() =>
            setSelected(null)
          }
        >

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: 12,
              marginBottom:
                18,
            }}
          >

            <div
              className="avatar"
              style={{
                width: 55,
                height: 55,
                fontSize: 18,
              }}
            >
              {selected.name
                ?.charAt(0) ||
                "น"}
            </div>

            <div>

              <h3
                style={{
                  margin: 0,
                  color:
                    "#21477f",
                }}
              >
                {selected.name}
              </h3>

              <div
                style={{
                  color:
                    "#8090aa",
                  fontSize: 12,
                }}
              >
                รหัส{" "}
                {selected.studentId}
              </div>

            </div>

          </div>


          <div className="detail-grid">

            <Info
              label="ชื่อ-นามสกุล"
              value={
                selected.name
              }
            />

            <Info
              label="อีเมล"
              value={
                selected.email
              }
            />

            <Info
              label="เบอร์โทร"
              value={
                selected.phone
              }
            />

            <Info
              label="สาขา"
              value={
                selected.major
              }
            />

            <Info
              label="สถานประกอบการ"
              value={
                selected.company
              }
            />

            <Info
              label="ตำแหน่ง"
              value={
                selected.position
              }
            />

            <Info
              label="วันเริ่มฝึกงาน"
              value={
                formatDate(
                  selected.internshipStart
                )
              }
            />

            <Info
              label="วันสิ้นสุด"
              value={
                formatDate(
                  selected.internshipEnd
                )
              }
            />

            <Info
              label="สัปดาห์ปัจจุบัน"
              value={
                selected.currentWeek
                  ? `สัปดาห์ที่ ${selected.currentWeek}`
                  : "-"
              }
            />

            <Info
              label="ความคืบหน้า"
              value={
                `${selected.progress || 0}%`
              }
            />

            <Info
              label="สถานะ"
              value={
                selected.status
              }
            />

            <Info
              label="ที่อยู่"
              value={
                selected.address
              }
            />

          </div>

        </Modal>

      )}

    </div>
  );
}


function Info({
  label,
  value,
}) {

  return (
    <div
      style={{
        padding: 10,
        border:
          "1px solid #e7edf6",
        borderRadius: 8,
        background:
          "#fbfcff",
      }}
    >

      <div
        style={{
          color:
            "#8b9ab1",
          fontSize: 10,
          marginBottom: 4,
        }}
      >
        {label}
      </div>

      <div
        style={{
          color:
            "#38547f",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {value || "-"}
      </div>

    </div>
  );
}


function formatDate(date) {

  if (!date) return "-";

  return new Date(date)
    .toLocaleDateString(
      "th-TH",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
}