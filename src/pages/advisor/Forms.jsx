import {
  useEffect,
  useRef,
  useState,
} from "react";

import Card from "../../components/Card";
import PageTitle from "../../components/PageTitle";

import { api, FILE_BASE_URL } from "../../services/api";

import "./advisor.css";


const categories = [
  "แบบฟอร์มนักศึกษา",
  "แบบประเมิน",
  "แบบฟอร์มรายงาน",
  "เอกสารอื่นๆ",
];


export default function AdvisorForms() {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: categories[0],
  });

  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);


  async function load() {

    try {

      const result = await api("/forms");

      setItems(result || []);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {
    load();
  }, []);


  function resetForm() {

    setForm({
      title: "",
      description: "",
      category: categories[0],
    });

    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }


  async function handleUpload() {

    setError("");

    if (!file) {
      setError("กรุณาเลือกไฟล์ที่ต้องการอัปโหลด");
      return;
    }

    if (!form.title.trim()) {
      setError("กรุณาระบุชื่อไฟล์ / หัวข้อ");
      return;
    }

    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("category", form.category);
    formData.append("file", file);

    setUploading(true);

    try {

      await api("/forms/upload", {
        method: "POST",
        body: formData,
      });

      resetForm();

      await load();

    } catch (err) {

      setError(err.message);

    } finally {

      setUploading(false);

    }
  }


  async function remove(id) {

    if (!confirm("ต้องการลบไฟล์นี้หรือไม่?")) {
      return;
    }

    try {

      await api(`/forms/${id}`, {
        method: "DELETE",
      });

      await load();

    } catch (err) {

      alert(err.message);

    }
  }


  return (
    <div className="content">

      <PageTitle
        title="แบบฟอร์มต่าง ๆ"
        subtitle="อัปโหลดแบบฟอร์มและเอกสารให้นักศึกษาดาวน์โหลดจากหน้าแบบฟอร์มของตัวเอง"
      />


      <div className="two-col advisor">

        <Card title="อัปโหลดไฟล์ใหม่">

          <div className="form-grid">

            <label>

              ชื่อไฟล์ / หัวข้อ

              <input
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                placeholder="เช่น แบบฟอร์มรายงานประจำสัปดาห์"
              />

            </label>


            <label>

              หมวดหมู่

              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
              >

                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}

              </select>

            </label>


            <label>

              รายละเอียด (ถ้ามี)

              <textarea
                rows="4"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                placeholder="คำอธิบายสั้น ๆ เกี่ยวกับไฟล์นี้..."
              />

            </label>


            <label>

              เลือกไฟล์ (pdf, doc, xls, ppt, zip, รูปภาพ — สูงสุด 15MB)

              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) =>
                  setFile(e.target.files?.[0] || null)
                }
              />

            </label>


            {error && (
              <div
                style={{
                  color: "#d64545",
                  fontSize: 12,
                }}
              >
                {error}
              </div>
            )}


            <div
              style={{
                display: "flex",
                gap: 8,
              }}
            >

              <button
                className="primary"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading
                  ? "กำลังอัปโหลด..."
                  : "อัปโหลดไฟล์"}
              </button>

            </div>

          </div>

        </Card>


        <Card title={`ไฟล์ทั้งหมด (${items.length})`}>

          {loading && (
            <div className="empty">
              กำลังโหลด...
            </div>
          )}


          {!loading && !items.length && (
            <div className="empty">
              ยังไม่มีไฟล์ที่อัปโหลด
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
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >

                  <div>

                    <b>
                      {item.title}
                    </b>

                    <small>
                      {item.category}
                      {" · "}
                      {item.sizeLabel}
                    </small>

                    {item.description && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#8a99b0",
                          marginTop: 4,
                        }}
                      >
                        {item.description}
                      </div>
                    )}

                  </div>


                  <div
                    style={{
                      display: "flex",
                      gap: 5,
                      alignItems: "flex-start",
                    }}
                  >

                    <a
                      className="small-btn"
                      href={FILE_BASE_URL + item.url}
                      ref={(el) => {
                        if (el) {
                          el.setAttribute(
                            "download",
                            item.originalName || ""
                          );
                        }
                      }}
                    >
                      ดาวน์โหลด
                    </a>

                    <button
                      className="small-btn danger-btn"
                      onClick={() => remove(item._id)}
                    >
                      ลบ
                    </button>

                  </div>

                </div>

              </div>

            ))}

        </Card>

      </div>

    </div>
  );
}