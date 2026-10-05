import { useEffect, useState } from "react";

import Card from "../../components/Card";
import PageTitle from "../../components/PageTitle";

import { api } from "../../services/api";

import "./student.css";

export default function Profile({
  user,
  student,
  onSaved,
}) {
  const [f, setF] =
    useState({
      name:
        user.name || '',
      email:
        student?.email || '',
      major:
        student?.major || '',
      phone:
        student?.phone || '',
      address:
        student?.address || '',
    });

  const [password, setPassword] =
    useState({
      oldPassword: '',
      newPassword: '',
    });

  const [saving, setSaving] =
    useState(false);

  const [
    changing,
    setChanging,
  ] = useState(false);

  const [message, setMessage] =
    useState('');

  const [error, setError] =
    useState('');

  useEffect(() => {
    setF({
      name:
        user.name || '',
      email:
        student?.email || '',
      major:
        student?.major || '',
      phone:
        student?.phone || '',
      address:
        student?.address || '',
    });
  }, [
    user.name,
    student?._id,
  ]);

  async function save(e) {
    e.preventDefault();

    setSaving(true);
    setMessage('');
    setError('');

    try {
      let result;

      if (
        user.role ===
        'student'
      ) {
        result = await api(
          `/students/student-id/${
            user.studentId ||
            user.username
          }`,
          {
            method: 'PUT',
            body: JSON.stringify(
              f
            ),
          }
        );
      } else {
        result = await api(
          '/auth/me',
          {
            method: 'PUT',
            body: JSON.stringify({
              name: f.name,
            }),
          }
        );
      }

      const updatedUser = {
        ...user,
        name:
          result.user?.name ||
          result.data?.name ||
          f.name,
      };

      localStorage.setItem(
        'internship_user',
        JSON.stringify(
          updatedUser
        )
      );

      onSaved(
        updatedUser,
        result.student ||
          result.data
      );

      setMessage(
        'บันทึกโปรไฟล์เรียบร้อยแล้ว'
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(
    e
  ) {
    e.preventDefault();

    setChanging(true);
    setMessage('');
    setError('');

    try {
      await api(
        '/auth/password',
        {
          method: 'PUT',
          body: JSON.stringify(
            password
          ),
        }
      );

      setPassword({
        oldPassword: '',
        newPassword: '',
      });

      setMessage(
        'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว'
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setChanging(false);
    }
  }

  return (
    <div className="content narrow">
      <PageTitle
        title="โปรไฟล์"
        subtitle="แก้ไขข้อมูลส่วนตัวและข้อมูลบัญชีผู้ใช้งาน"
      />

      <Card title="ข้อมูลส่วนตัว">
        <form
          className="form-grid"
          onSubmit={save}
        >
          <label>
            ชื่อ - นามสกุล

            <input
              required
              value={f.name}
              onChange={(e) =>
                setF({
                  ...f,
                  name:
                    e.target.value,
                })
              }
            />
          </label>

          <label>
            ชื่อผู้ใช้

            <input
              value={
                user.username
              }
              disabled
            />
          </label>

          <label>
            อีเมล

            <input
              type="email"
              value={f.email}
              onChange={(e) =>
                setF({
                  ...f,
                  email:
                    e.target.value,
                })
              }
            />
          </label>

          {user.role ===
            'student' && (
            <>
              <label>
                สาขาวิชา

                <input
                  value={f.major}
                  onChange={(e) =>
                    setF({
                      ...f,
                      major:
                        e.target
                          .value,
                    })
                  }
                />
              </label>

              <label>
                เบอร์โทรศัพท์

                <input
                  value={f.phone}
                  onChange={(e) =>
                    setF({
                      ...f,
                      phone:
                        e.target
                          .value,
                    })
                  }
                />
              </label>

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
                        e.target
                          .value,
                    })
                  }
                />
              </label>
            </>
          )}

          <div className="form-actions full-field">
            <button
              className="primary"
              disabled={saving}
            >
              {saving
                ? 'กำลังบันทึก...'
                : 'บันทึกข้อมูลโปรไฟล์'}
            </button>
          </div>
        </form>
      </Card>

      <Card title="เปลี่ยนรหัสผ่าน">
        <form
          className="form-grid"
          onSubmit={
            changePassword
          }
        >
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
                    e.target
                      .value,
                })
              }
            />
          </label>

          <label>
            รหัสผ่านใหม่

            <input
              required
              minLength="6"
              type="password"
              value={
                password.newPassword
              }
              onChange={(e) =>
                setPassword({
                  ...password,
                  newPassword:
                    e.target
                      .value,
                })
              }
            />
          </label>

          <div className="form-actions full-field">
            <button
              className="secondary"
              disabled={changing}
            >
              {changing
                ? 'กำลังเปลี่ยน...'
                : 'เปลี่ยนรหัสผ่าน'}
            </button>
          </div>
        </form>
      </Card>

      {message && (
        <div className="success-box">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}
    </div>
  );
}