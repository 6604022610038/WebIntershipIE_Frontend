import { useRef, useState } from "react";

import Card from "../../components/Card";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";
import PageTitle from "../../components/PageTitle";
import Empty from "../../components/Empty";

import { api, FILE_BASE_URL } from "../../services/api";
import { fmt } from "../../utils/format";

import "./student.css";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ACCEPTED_EXT =
  /\.(jpg|jpeg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|zip)$/i;

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(mimetype = "", name = "") {
  return (
    mimetype.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(name)
  );
}

export default function Reports({ data, refresh }) {
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const reports = data?.weeklyReports || [];

  async function saveWeekly(formData) {
    setSaving(true);

    try {
      const method = editing ? "PUT" : "POST";

      const path = editing
        ? `/weekly-reports/${editing._id}`
        : "/weekly-reports";

      await api(path, {
        method,
        body: formData,
      });

      setShow(false);
      setEditing(null);

      refresh();
    } catch (e) {
      alert(e.message || "ไม่สามารถบันทึกรายงานได้");
    } finally {
      setSaving(false);
    }
  }

  async function removeWeekly(id) {
    if (!confirm("ต้องการลบรายงานประจำสัปดาห์นี้หรือไม่?")) {
      return;
    }

    try {
      await api(`/weekly-reports/${id}`, {
        method: "DELETE",
      });

      refresh();
    } catch (e) {
      alert(e.message || "ไม่สามารถลบรายงานได้");
    }
  }

  return (
    <div className="content">
      <PageTitle
        title="บันทึกรายงานการฝึกงาน"
        subtitle="รายงานประจำสัปดาห์ พร้อมแนบไฟล์และรูปภาพประกอบ"
        action={
          <div className="form-actions">
            <button
              type="button"
              className="primary"
              onClick={() => {
                setEditing(null);
                setShow(true);
              }}
            >
              ＋ รายงานประจำสัปดาห์
            </button>
          </div>
        }
      />

      <Card title={`รายงานประจำสัปดาห์ (${reports.length})`}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>สัปดาห์</th>
                <th>ช่วงวันที่</th>
                <th>หัวข้องาน</th>
                <th>ไฟล์แนบ</th>
                <th>สถานะ</th>
                <th>วันที่ส่ง</th>
                <th>จัดการ</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((r) => (
                <tr key={r._id}>
                  <td>
                    <b>สัปดาห์ที่ {r.weekNumber}</b>
                  </td>

                  <td>
                    {fmt(r.startDate)} - {fmt(r.endDate)}
                  </td>

                  <td>{r.workTitle}</td>

                  <td>
                    {r.attachments?.length ? (
                      <span className="attachment-tag">
                        📎 {r.attachments.length} ไฟล์
                      </span>
                    ) : (
                      <span
                        className="attachment-tag"
                        style={{ color: "#a9b6cf" }}
                      >
                        ไม่มีไฟล์แนบ
                      </span>
                    )}
                  </td>

                  <td>
                    <Badge
                      tone={
                        r.status === "อาจารย์ตรวจแล้ว"
                          ? "green"
                          : r.status === "ต้องแก้ไข"
                          ? "red"
                          : "orange"
                      }
                    >
                      {r.status || "รอตรวจ"}
                    </Badge>
                  </td>

                  <td>{fmt(r.createdAt)}</td>

                  <td>
                    <button
                      type="button"
                      className="small-btn"
                      onClick={() => {
                        setEditing(r);
                        setShow(true);
                      }}
                    >
                      แก้ไข
                    </button>{" "}

                    <button
  className="small-btn danger-btn"
  onClick={() => remove(a._id)}
>
  ลบ
</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!reports.length && (
            <Empty text="ยังไม่มีรายงานประจำสัปดาห์" />
          )}
        </div>
      </Card>

      {show && (
        <WeeklyModal
          initial={editing}
          onClose={() => {
            setShow(false);
            setEditing(null);
          }}
          onSave={saveWeekly}
          saving={saving}
        />
      )}
    </div>
  );
}

function WeeklyModal({
  initial,
  onClose,
  onSave,
  saving,
}) {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    weekNumber: initial?.weekNumber || "",
    startDate: initial?.startDate
      ? initial.startDate.slice(0, 10)
      : "",
    endDate: initial?.endDate
      ? initial.endDate.slice(0, 10)
      : "",
    workTitle: initial?.workTitle || "",
    workDescription: initial?.workDescription || "",
    problems: initial?.problems || "",
    solution: initial?.solution || "",
  });

  const [existingAttachments, setExistingAttachments] = useState(
    initial?.attachments || []
  );

  const [removedAttachments, setRemovedAttachments] =
    useState([]);

  const [newFiles, setNewFiles] = useState([]);

  const [fileError, setFileError] = useState("");

  const [error, setError] = useState("");

  function field(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function totalAttachmentCount() {
    return existingAttachments.length + newFiles.length;
  }

  function handleFilesSelected(fileList) {
    setFileError("");

    const incoming = Array.from(fileList || []);

    const accepted = [];

    for (const f of incoming) {
      if (
        totalAttachmentCount() + accepted.length >=
        MAX_FILES
      ) {
        setFileError(
          `แนบไฟล์ได้สูงสุด ${MAX_FILES} ไฟล์ต่อรายงาน`
        );

        break;
      }

      if (!ACCEPTED_EXT.test(f.name)) {
        setFileError(
          "รองรับเฉพาะไฟล์รูปภาพหรือเอกสาร (jpg, png, pdf, doc, xls, ppt, zip)"
        );

        continue;
      }

      if (f.size > MAX_FILE_SIZE) {
        setFileError(
          "ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10MB ต่อไฟล์)"
        );

        continue;
      }

      accepted.push(f);
    }

    if (accepted.length) {
      setNewFiles((prev) => [
        ...prev,
        ...accepted,
      ]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeNewFile(index) {
    setNewFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  function removeExistingAttachment(filename) {
    setExistingAttachments((prev) =>
      prev.filter((a) => a.filename !== filename)
    );

    setRemovedAttachments((prev) => [
      ...prev,
      filename,
    ]);
  }

  async function submit(e) {
    e.preventDefault();

    setError("");

    if (
      !form.weekNumber ||
      !form.startDate ||
      !form.endDate ||
      !form.workTitle ||
      !form.workDescription
    ) {
      setError("กรุณากรอกข้อมูลรายงานให้ครบ");

      return;
    }

    const formData = new FormData();

    formData.append(
      "weekNumber",
      form.weekNumber
    );

    formData.append(
      "startDate",
      form.startDate
    );

    formData.append(
      "endDate",
      form.endDate
    );

    formData.append(
      "workTitle",
      form.workTitle
    );

    formData.append(
      "workDescription",
      form.workDescription
    );

    formData.append(
      "problems",
      form.problems
    );

    formData.append(
      "solution",
      form.solution
    );

    if (removedAttachments.length) {
      formData.append(
        "removeAttachments",
        JSON.stringify(removedAttachments)
      );
    }

    newFiles.forEach((f) => {
      formData.append(
        "attachments",
        f
      );
    });

    onSave(formData);
  }

  return (
    <Modal
      title={
        initial
          ? "แก้ไขรายงานประจำสัปดาห์"
          : "เพิ่มรายงานประจำสัปดาห์"
      }
      onClose={onClose}
    >
      <form
        className="form-grid"
        onSubmit={submit}
      >
        <label>
          สัปดาห์ที่

          <input
            type="number"
            min="1"
            value={form.weekNumber}
            onChange={(e) =>
              field(
                "weekNumber",
                e.target.value
              )
            }
          />
        </label>

        <label>
          หัวข้องาน

          <input
            value={form.workTitle}
            onChange={(e) =>
              field(
                "workTitle",
                e.target.value
              )
            }
          />
        </label>

        <label>
          วันที่เริ่ม

          <input
            type="date"
            value={form.startDate}
            onChange={(e) =>
              field(
                "startDate",
                e.target.value
              )
            }
          />
        </label>

        <label>
          วันที่สิ้นสุด

          <input
            type="date"
            value={form.endDate}
            onChange={(e) =>
              field(
                "endDate",
                e.target.value
              )
            }
          />
        </label>

        <label className="full-field">
          รายละเอียดงานที่ทำ

          <textarea
            rows={3}
            value={form.workDescription}
            onChange={(e) =>
              field(
                "workDescription",
                e.target.value
              )
            }
          />
        </label>

        <label>
          ปัญหาที่พบ

          <textarea
            rows={2}
            value={form.problems}
            onChange={(e) =>
              field(
                "problems",
                e.target.value
              )
            }
          />
        </label>

        <label>
          แนวทางแก้ไข

          <textarea
            rows={2}
            value={form.solution}
            onChange={(e) =>
              field(
                "solution",
                e.target.value
              )
            }
          />
        </label>

        <div className="full-field">
          <label
            style={{
              marginBottom: 6,
              display: "block",
            }}
          >
            ไฟล์แนบ / รูปภาพ
          </label>

          <div
            className="file-upload-zone"
            onClick={() =>
              fileInputRef.current?.click()
            }
          >
            <span className="file-upload-icon">
              📎
            </span>

            <span>
              คลิกเพื่อแนบไฟล์หรือรูปภาพ
            </span>

            <span className="file-upload-hint">
              รองรับ JPG, PNG, PDF, Word, Excel,
              PPT, ZIP (สูงสุด {MAX_FILES} ไฟล์
              ไฟล์ละไม่เกิน 10MB)
            </span>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
              onChange={(e) =>
                handleFilesSelected(
                  e.target.files
                )
              }
            />
          </div>

          {fileError && (
            <p
              className="error-text"
              style={{ marginTop: 6 }}
            >
              {fileError}
            </p>
          )}

          {(existingAttachments.length > 0 ||
            newFiles.length > 0) && (
            <div className="file-chip-list">

              {existingAttachments.map((a) => (
                <div
                  className="file-chip"
                  key={a.filename}
                >
                  <span className="file-chip-icon">
                    {isImageFile(
                      a.mimetype,
                      a.originalName
                    )
                      ? "🖼"
                      : "📄"}
                  </span>

                  <div className="file-chip-info">
                    <a
                      href={`${FILE_BASE_URL}${a.url}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <b>
                        {a.originalName}
                      </b>
                    </a>

                    <span>
                      {formatBytes(a.size)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="file-chip-remove"
                    onClick={() =>
                      removeExistingAttachment(
                        a.filename
                      )
                    }
                    title="ลบไฟล์แนบนี้"
                  >
                    ×
                  </button>
                </div>
              ))}

              {newFiles.map((f, i) => (
                <div
                  className="file-chip"
                  key={`${f.name}-${i}`}
                >
                  <span className="file-chip-icon">
                    {isImageFile(
                      f.type,
                      f.name
                    )
                      ? "🖼"
                      : "📄"}
                  </span>

                  <div className="file-chip-info">
                    <b>{f.name}</b>

                    <span>
                      {formatBytes(f.size)} ·
                      ยังไม่ได้บันทึก
                    </span>
                  </div>

                  <button
                    type="button"
                    className="file-chip-remove"
                    onClick={() =>
                      removeNewFile(i)
                    }
                    title="เอาไฟล์นี้ออก"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions full-field">
          <button
            type="button"
            className="secondary"
            onClick={onClose}
          >
            ยกเลิก
          </button>

          <button
            type="submit"
            className="primary"
            disabled={saving}
          >
            {saving
              ? "กำลังบันทึก..."
              : "บันทึกและส่งรายงาน"}
          </button>

          {error && (
            <span className="error-text">
              {error}
            </span>
          )}
        </div>
      </form>
    </Modal>
  );
}