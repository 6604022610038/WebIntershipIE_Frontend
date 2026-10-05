import { useEffect, useState } from "react";

import Card from "../../components/Card";
import PageTitle from "../../components/PageTitle";

import { api } from "../../services/api";

import "./advisor.css";


export default function AdvisorProfile({
  user = {},
  student = {},
  onSaved,
}) {

  // =====================================
  // PROFILE FORM
  // =====================================

  const [f, setF] = useState({
    name:
      user.name || "",

    email:
      student?.email ||
      user.email ||
      "",

    major:
      student?.major ||
      user.major ||
      "",

    phone:
      student?.phone ||
      user.phone ||
      "",

    address:
      student?.address ||
      user.address ||
      "",
  });


  // =====================================
  // PASSWORD
  // =====================================

  const [password, setPassword] =
    useState({
      oldPassword: "",
      newPassword: "",
    });


  // =====================================
  // STATE
  // =====================================

  const [saving, setSaving] =
    useState(false);

  const [changing, setChanging] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  // =====================================
  // UPDATE FORM WHEN USER CHANGES
  // =====================================

  useEffect(() => {

    setF({
      name:
        user?.name || "",

      email:
        student?.email ||
        user?.email ||
        "",

      major:
        student?.major ||
        user?.major ||
        "",

      phone:
        student?.phone ||
        user?.phone ||
        "",

      address:
        student?.address ||
        user?.address ||
        "",
    });

  }, [
    user?.name,
    user?.email,
    user?.major,
    user?.phone,
    user?.address,
    student?._id,
    student?.email,
    student?.major,
    student?.phone,
    student?.address,
  ]);


  // =====================================
  // SAVE PROFILE
  // =====================================

  async function save(e) {

    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {

      let result;


      // =================================
      // STUDENT
      // =================================

      if (
        user?.role === "student"
      ) {

        result = await api(
          `/students/student-id/${
            user.studentId ||
            user.username
          }`,
          {
            method: "PUT",

            body: JSON.stringify({
              name: f.name,
              email: f.email,
              major: f.major,
              phone: f.phone,
              address: f.address,
            }),
          }
        );

      }

      // =================================
      // ADVISOR / TEACHER
      // =================================

      else {

        result = await api(
          "/auth/me",
          {
            method: "PUT",

            body: JSON.stringify({
              name: f.name,
            }),
          }
        );

      }


      // =================================
      // UPDATE LOCAL USER
      // =================================

      const updatedUser = {
        ...user,

        name:
          result?.user?.name ||
          result?.data?.name ||
          f.name,

        email:
          result?.user?.email ||
          result?.data?.email ||
          user?.email,

        major:
          result?.student?.major ||
          result?.data?.major ||
          user?.major,

        phone:
          result?.student?.phone ||
          result?.data?.phone ||
          user?.phone,

        address:
          result?.student?.address ||
          result?.data?.address ||
          user?.address,
      };


      localStorage.setItem(
        "internship_user",
        JSON.stringify(
          updatedUser
        )
      );


      // =================================
      // SEND UPDATED DATA TO APP
      // =================================

      if (
        typeof onSaved ===
        "function"
      ) {

        onSaved(
          updatedUser,

          result?.student ||
            result?.data ||
            student
        );

      }


      setMessage(
        "บันทึกโปรไฟล์เรียบร้อยแล้ว"
      );

    } catch (e) {

      setError(
        e?.message ||
        "ไม่สามารถบันทึกข้อมูลได้"
      );

    } finally {

      setSaving(false);

    }
  }


  // =====================================
  // CHANGE PASSWORD
  // =====================================

  async function changePassword(
    e
  ) {

    e.preventDefault();

    setChanging(true);
    setMessage("");
    setError("");

    try {

      await api(
        "/auth/password",
        {
          method: "PUT",

          body: JSON.stringify(
            password
          ),
        }
      );


      setPassword({
        oldPassword: "",
        newPassword: "",
      });


      setMessage(
        "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว"
      );

    } catch (e) {

      setError(
        e?.message ||
        "ไม่สามารถเปลี่ยนรหัสผ่านได้"
      );

    } finally {

      setChanging(false);

    }
  }


  // =====================================
  // UI
  // =====================================

  return (
    <div className="content narrow">

      <PageTitle
        title="โปรไฟล์"
        subtitle="แก้ไขข้อมูลส่วนตัวและข้อมูลบัญชีผู้ใช้งาน"
      />


      {/* =================================
          PERSONAL INFORMATION
      ================================== */}

      <Card title="ข้อมูลส่วนตัว">

        <form
          className="form-grid"
          onSubmit={save}
        >

          {/* NAME */}

          <label>

            ชื่อ - นามสกุล

            <input
              required
              value={
                f.name
              }
              onChange={(e) =>
                setF({
                  ...f,
                  name:
                    e.target.value,
                })
              }
            />

          </label>


          {/* USERNAME */}

          <label>

            ชื่อผู้ใช้

            <input
              value={
                user?.username ||
                ""
              }
              disabled
            />

          </label>


          {/* EMAIL */}

          <label>

            อีเมล

            <input
              type="email"
              value={
                f.email
              }
              onChange={(e) =>
                setF({
                  ...f,
                  email:
                    e.target.value,
                })
              }
            />

          </label>


          {/* =================================
              STUDENT ONLY
          ================================== */}

          {user?.role ===
            "student" && (
            <>

              {/* MAJOR */}

              <label>

                สาขาวิชา

                <input
                  value={
                    f.major
                  }
                  onChange={(e) =>
                    setF({
                      ...f,
                      major:
                        e.target.value,
                    })
                  }
                />

              </label>


              {/* PHONE */}

              <label>

                เบอร์โทรศัพท์

                <input
                  value={
                    f.phone
                  }
                  onChange={(e) =>
                    setF({
                      ...f,
                      phone:
                        e.target.value,
                    })
                  }
                />

              </label>


              {/* ADDRESS */}

              <label className="full-field">

                ที่อยู่

                <textarea
                  rows="3"
                  value={
                    f.address
                  }
                  onChange={(e) =>
                    setF({
                      ...f,
                      address:
                        e.target.value,
                    })
                  }
                />

              </label>

            </>
          )}


          {/* SAVE */}

          <div className="form-actions full-field">

            <button
              type="submit"
              className="primary"
              disabled={
                saving
              }
            >

              {saving
                ? "กำลังบันทึก..."
                : "บันทึกข้อมูลโปรไฟล์"}

            </button>

          </div>

        </form>

      </Card>


      {/* =================================
          CHANGE PASSWORD
      ================================== */}

      <Card title="เปลี่ยนรหัสผ่าน">

        <form
          className="form-grid"
          onSubmit={
            changePassword
          }
        >

          {/* OLD PASSWORD */}

          <label>

            รหัสผ่านเดิม

            <input
              required
              type="password"
              value={
                password.oldPassword
              }
              onChange={(e) =>
                setPassword({
                  ...password,
                  oldPassword:
                    e.target.value,
                })
              }
            />

          </label>


          {/* NEW PASSWORD */}

          <label>

            รหัสผ่านใหม่

            <input
              required
              minLength={6}
              type="password"
              value={
                password.newPassword
              }
              onChange={(e) =>
                setPassword({
                  ...password,
                  newPassword:
                    e.target.value,
                })
              }
            />

          </label>


          {/* CHANGE BUTTON */}

          <div className="form-actions full-field">

            <button
              type="submit"
              className="secondary"
              disabled={
                changing
              }
            >

              {changing
                ? "กำลังเปลี่ยน..."
                : "เปลี่ยนรหัสผ่าน"}

            </button>

          </div>

        </form>

      </Card>


      {/* =================================
          SUCCESS
      ================================== */}

      {message && (

        <div className="success-box">

          ✓ {message}

        </div>

      )}


      {/* =================================
          ERROR
      ================================== */}

      {error && (

        <div className="error-box">

          {error}

        </div>

      )}

    </div>
  );
}