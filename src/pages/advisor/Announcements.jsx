import {
  useEffect,
  useState,
} from "react";

import Card from "../../components/Card";
import PageTitle from "../../components/PageTitle";

import { api } from "../../services/api";

import "./advisor.css";


export default function AdvisorAnnouncements() {

  const [items, setItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [editing, setEditing] =
    useState(null);


  const [form, setForm] =
    useState({
      title: "",
      content: "",
      type: "ทั่วไป",
      publishDate: "",
    });


  async function load() {

    try {

      const result =
        await api(
          "/announcements"
        );

      setItems(result || []);

    } catch (error) {

      alert(
        error.message
      );

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {
    load();
  }, []);


  function openCreate() {

    setEditing(null);

    setForm({
      title: "",
      content: "",
      type: "ทั่วไป",
      publishDate: "",
    });

  }


  function openEdit(item) {

    setEditing(item);

    setForm({
      title:
        item.title || "",

      content:
        item.content || "",

      type:
        item.type ||
        "ทั่วไป",

      publishDate:
        item.publishDate
          ? new Date(
              item.publishDate
            )
              .toISOString()
              .slice(0, 10)
          : "",
    });

  }


  async function save() {

    if (
      !form.title.trim() ||
      !form.content.trim()
    ) {

      alert(
        "กรุณากรอกข้อมูลให้ครบ"
      );

      return;
    }


    try {

      const options = {
        method:
          editing
            ? "PUT"
            : "POST",

        body: JSON.stringify({
          ...form,
          publishDate:
            form.publishDate ||
            new Date(),
          isPublished: true,
        }),
      };


      await api(
        editing
          ? `/announcements/${editing._id}`
          : "/announcements",
        options
      );


      alert(
        editing
          ? "แก้ไขประกาศสำเร็จ"
          : "สร้างประกาศสำเร็จ"
      );


      openCreate();

      await load();

    } catch (error) {

      alert(
        error.message
      );

    }

  }


  async function remove(id) {

    if (
      !confirm(
        "ต้องการลบประกาศนี้หรือไม่?"
      )
    ) {
      return;
    }


    try {

      await api(
        `/announcements/${id}`,
        {
          method: "DELETE",
        }
      );

      await load();

    } catch (error) {

      alert(
        error.message
      );

    }

  }


  return (
    <div className="content">

      <PageTitle
        title="ประกาศข่าวสาร"
        subtitle="สร้างและเผยแพร่ข่าวสารหรือกำหนดการให้นักศึกษาทราบ"
      />


      <div className="two-col advisor">

        <Card
          title={
            editing
              ? "แก้ไขประกาศ"
              : "สร้างประกาศใหม่"
          }
        >

          <div className="form-grid">

            <label>

              หัวข้อประกาศ

              <input
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title:
                      e.target.value,
                  })
                }
                placeholder="เช่น กำหนดส่งรายงานสัปดาห์ที่ 6"
              />

            </label>


            <label>

              ประเภท

              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type:
                      e.target.value,
                  })
                }
              >

                <option>
                  ทั่วไป
                </option>

                <option>
                  สำคัญ
                </option>

                <option>
                  กำหนดการ
                </option>

              </select>

            </label>


            <label>

              วันที่เผยแพร่

              <input
                type="date"
                value={
                  form.publishDate
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    publishDate:
                      e.target.value,
                  })
                }
              />

            </label>


            <label>

              รายละเอียด

              <textarea
                rows="8"
                value={
                  form.content
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    content:
                      e.target.value,
                  })
                }
                placeholder="รายละเอียดข่าวสาร..."
              />

            </label>


            <div
              style={{
                display:
                  "flex",
                gap: 8,
              }}
            >

              <button
                className="primary"
                onClick={save}
              >
                {editing
                  ? "บันทึกการแก้ไข"
                  : "เผยแพร่ประกาศ"}
              </button>


              {editing && (

                <button
                  className="secondary"
                  onClick={
                    openCreate
                  }
                >
                  ยกเลิก
                </button>

              )}

            </div>

          </div>

        </Card>


        <Card
          title={`ประกาศย้อนหลัง (${items.length})`}
        >

          {loading && (
            <div className="empty">
              กำลังโหลด...
            </div>
          )}


          {!loading &&
            !items.length && (

              <div className="empty">
                ยังไม่มีประกาศ
              </div>

            )}


          {!loading &&
            items.map((item) => (

              <div
                key={item._id}
                className="announcement-item"
              >

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    gap: 10,
                  }}
                >

                  <div>

                    <b>
                      {item.title}
                    </b>

                    <small>
                      {formatDate(
                        item.publishDate
                      )}{" "}
                      ·{" "}
                      {item.type}
                    </small>

                  </div>


                  <div
                    style={{
                      display:
                        "flex",
                      gap: 5,
                    }}
                  >

                    <button
                      className="small-btn"
                      onClick={() =>
                        openEdit(item)
                      }
                    >
                      แก้ไข
                    </button>

                    <button
                      className="small-btn danger-btn"
                      onClick={() =>
                        remove(
                          item._id
                        )
                      }
                    >
                      ลบ
                    </button>

                  </div>

                </div>


                <p>
                  {item.content}
                </p>

              </div>

            ))}

        </Card>

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