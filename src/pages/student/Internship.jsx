import { useState } from "react";

import Card from "../../components/Card";
import PageTitle from "../../components/PageTitle";

import { api } from "../../services/api";

export default function Internship({
  student,
  onSave,
}) {
  const safeStudent = student || {};

  const [form, setForm] = useState({
    company: safeStudent.company || "",
    position: safeStudent.position || "",
    internshipStart:
      safeStudent.internshipStart
        ? safeStudent.internshipStart.slice(0, 10)
        : "",
    internshipEnd:
      safeStudent.internshipEnd
        ? safeStudent.internshipEnd.slice(0, 10)
        : "",
    status:
      safeStudent.status || "กำลังฝึกงาน",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function changeField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!safeStudent.studentId) {
      setError(
        "ไม่พบรหัสนักศึกษา กรุณาเข้าสู่ระบบใหม่อีกครั้ง"
      );
      return;
    }

    setSaving(true);

    try {
      const result = await api(
        `/internships/${safeStudent.studentId}`,
        {
          method: "PUT",
          body: JSON.stringify(form),
        }
      );

      const updatedStudent =
        result?.data || {
          ...safeStudent,
          ...form,
        };

      if (onSave) {
        onSave(updatedStudent);
      }

      setMessage("บันทึกข้อมูลสำเร็จ");
    } catch (err) {
      setError(
        err?.message ||
          "ไม่สามารถบันทึกข้อมูลการฝึกงานได้"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="content narrow">

      <PageTitle
        title="ข้อมูลการฝึกงาน"
        subtitle="ตรวจสอบและแก้ไขข้อมูลสถานที่ฝึกงานของคุณ"
      />

      <Card title="ข้อมูลการฝึกงานปัจจุบัน">

        <form
          className="form-grid"
          onSubmit={handleSubmit}
        >

          <label>
            สถานประกอบการ

            <input
              type="text"
              value={form.company}
              onChange={(e) =>
                changeField(
                  "company",
                  e.target.value
                )
              }
              placeholder="กรอกชื่อสถานประกอบการ"
            />
          </label>


          <label>
            ตำแหน่งงาน

            <input
              type="text"
              value={form.position}
              onChange={(e) =>
                changeField(
                  "position",
                  e.target.value
                )
              }
              placeholder="กรอกตำแหน่งงาน"
            />
          </label>


          <label>
            วันเริ่มฝึกงาน

            <input
              type="date"
              value={form.internshipStart}
              onChange={(e) =>
                changeField(
                  "internshipStart",
                  e.target.value
                )
              }
            />
          </label>


          <label>
            วันสิ้นสุด

            <input
              type="date"
              value={form.internshipEnd}
              onChange={(e) =>
                changeField(
                  "internshipEnd",
                  e.target.value
                )
              }
            />
          </label>


          <label>
            สถานะ

            <select
              value={form.status}
              onChange={(e) =>
                changeField(
                  "status",
                  e.target.value
                )
              }
            >
              <option value="กำลังฝึกงาน">
                กำลังฝึกงาน
              </option>

              <option value="เสร็จสิ้น">
                เสร็จสิ้น
              </option>

              <option value="พักการฝึกงาน">
                พักการฝึกงาน
              </option>
            </select>
          </label>


          <div className="form-actions">

            <button
              type="submit"
              className="primary"
              disabled={saving}
            >
              {saving
                ? "กำลังบันทึก..."
                : "บันทึกข้อมูล"}
            </button>

          </div>


          {message && (
            <div className="success-text">
              {message}
            </div>
          )}


          {error && (
            <div className="error-text">
              {error}
            </div>
          )}

        </form>

      </Card>

    </div>
  );
}