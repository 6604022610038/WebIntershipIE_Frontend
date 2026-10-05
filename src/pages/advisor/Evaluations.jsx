import {
  useState,
} from "react";

import Card from "../../components/Card";
import PageTitle from "../../components/PageTitle";

import { api } from "../../services/api";

import "./advisor.css";


export default function AdvisorEvaluations({
  data,
  refresh,
}) {

  const students =
    data?.students || [];

  const evaluations =
    data?.evaluations || [];


  const [studentId, setStudentId] =
    useState(
      students[0]?.studentId || ""
    );

  const [comment, setComment] =
    useState("");


  const [skills, setSkills] =
    useState({
      knowledge: 5,
      performance: 5,
      problemSolving: 5,
      teamwork: 5,
      ethics: 5,
    });


  // ==============================
  // AUTO-CALCULATED OVERALL SCORE
  // คำนวณคะแนนรวมอัตโนมัติจากคะแนนย่อยทุกด้าน
  // ==============================

  const skillValues = [
    skills.knowledge,
    skills.performance,
    skills.problemSolving,
    skills.teamwork,
    skills.ethics,
  ];

  const allSkillsFilled =
    skillValues.every(
      (value) =>
        value !== "" &&
        value !== null &&
        value !== undefined &&
        !Number.isNaN(
          Number(value)
        )
    );

  const score = allSkillsFilled
    ? Math.round(
        (skillValues.reduce(
          (sum, value) =>
            sum + Number(value),
          0
        ) /
          skillValues.length) *
          10
      ) / 10
    : 0;


  async function save() {

    if (!studentId) {
      alert(
        "กรุณาเลือกนักศึกษา"
      );
      return;
    }

    if (!allSkillsFilled) {
      alert(
        "กรุณากรอกคะแนนย่อยให้ครบทุกด้านก่อนบันทึก"
      );
      return;
    }


    try {

      await api(
        "/evaluations",
        {
          method: "POST",

          body: JSON.stringify({
            studentId,
            score: Number(score),
            comment,
            skills: {
              knowledge:
                Number(
                  skills.knowledge
                ),

              performance:
                Number(
                  skills.performance
                ),

              problemSolving:
                Number(
                  skills.problemSolving
                ),

              teamwork:
                Number(
                  skills.teamwork
                ),

              ethics:
                Number(
                  skills.ethics
                ),
            },
          }),
        }
      );


      alert(
        "บันทึกผลประเมินสำเร็จ"
      );

      setComment("");

      refresh();

    } catch (error) {

      alert(
        error.message
      );

    }

  }


  const studentEvaluations =
    evaluations.filter(
      (item) =>
        item.studentId ===
        studentId
    );


  return (
    <div className="content">

      <PageTitle
        title="ประเมินผลนักศึกษา"
        subtitle="ประเมินความก้าวหน้าและผลการฝึกงานของนักศึกษา"
      />


      <div className="two-col advisor">

        <Card
          title="บันทึกผลการประเมิน"
        >

          <div className="form-grid">

            <label>
              นักศึกษา

              <select
                value={studentId}
                onChange={(e) =>
                  setStudentId(
                    e.target.value
                  )
                }
              >

                <option value="">
                  -- เลือกนักศึกษา --
                </option>

                {students.map(
                  (student) => (

                    <option
                      key={
                        student.studentId
                      }
                      value={
                        student.studentId
                      }
                    >
                      {student.name} (
                      {
                        student.studentId
                      }
                      )
                    </option>

                  )
                )}

              </select>

            </label>


            <Skill
              label="ความรู้"
              value={
                skills.knowledge
              }
              onChange={(value) =>
                setSkills({
                  ...skills,
                  knowledge:
                    value,
                })
              }
            />


            <Skill
              label="ประสิทธิภาพการทำงาน"
              value={
                skills.performance
              }
              onChange={(value) =>
                setSkills({
                  ...skills,
                  performance:
                    value,
                })
              }
            />


            <Skill
              label="การแก้ปัญหา"
              value={
                skills.problemSolving
              }
              onChange={(value) =>
                setSkills({
                  ...skills,
                  problemSolving:
                    value,
                })
              }
            />


            <Skill
              label="การทำงานเป็นทีม"
              value={
                skills.teamwork
              }
              onChange={(value) =>
                setSkills({
                  ...skills,
                  teamwork:
                    value,
                })
              }
            />


            <Skill
              label="ความรับผิดชอบ/จริยธรรม"
              value={
                skills.ethics
              }
              onChange={(value) =>
                setSkills({
                  ...skills,
                  ethics:
                    value,
                })
              }
            />


            <div className="score-summary">

              <span>
                คะแนนรวม (สรุปอัตโนมัติจากคะแนนย่อยทั้งหมด)
              </span>

              <strong>
                {allSkillsFilled
                  ? score
                  : "-"}
                /5
              </strong>

            </div>


            <label>

              ความคิดเห็นอาจารย์

              <textarea
                rows="5"
                value={comment}
                onChange={(e) =>
                  setComment(
                    e.target.value
                  )
                }
                placeholder="เขียนข้อเสนอแนะหรือความคิดเห็น..."
              />

            </label>


            <button
              className="primary"
              onClick={save}
            >
              บันทึกผลการประเมิน
            </button>

          </div>

        </Card>


        <Card
          title="ประวัติผลการประเมิน"
        >

          {!studentId && (

            <div className="empty">
              กรุณาเลือกนักศึกษา
            </div>

          )}


          {studentId &&
            !studentEvaluations.length && (

              <div className="empty">
                ยังไม่มีผลการประเมิน
              </div>

            )}


          {studentEvaluations.map(
            (item) => (

              <div
                key={item._id}
                className="evaluation-item"
              >

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                  }}
                >

                  <b>
                    คะแนน{" "}
                    {item.score}/5
                  </b>

                  <small>
                    {formatDate(
                      item.createdAt
                    )}
                  </small>

                </div>


                <p>
                  {item.comment ||
                    "ไม่มีความคิดเห็น"}
                </p>


                <div
                  className="skill-list"
                >

                  <span>
                    ความรู้:{" "}
                    {
                      item.skills
                        ?.knowledge ??
                      "-"
                    }
                  </span>

                  <span>
                    การทำงาน:{" "}
                    {
                      item.skills
                        ?.performance ??
                      "-"
                    }
                  </span>

                  <span>
                    แก้ปัญหา:{" "}
                    {
                      item.skills
                        ?.problemSolving ??
                      "-"
                    }
                  </span>

                  <span>
                    ทีม:{" "}
                    {
                      item.skills
                        ?.teamwork ??
                      "-"
                    }
                  </span>

                </div>

              </div>

            )
          )}

        </Card>

      </div>

    </div>
  );
}


function Skill({
  label,
  value,
  onChange,
}) {

  return (
    <label>

      {label}

      <select
        value={value}
        onChange={(e) =>
          onChange(
            Number(
              e.target.value
            )
          )
        }
      >

        {[0, 1, 2, 3, 4, 5].map(
          (number) => (

            <option
              key={number}
              value={number}
            >
              {number}
            </option>

          )
        )}

      </select>

    </label>
  );
}


function formatDate(date) {

  if (!date) return "-";

  return new Date(date)
    .toLocaleDateString(
      "th-TH"
    );
}