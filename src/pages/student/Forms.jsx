import {
  useEffect,
  useState,
} from "react";

import Card from "../../components/Card";
import PageTitle from "../../components/PageTitle";

import {
  api,
  FILE_BASE_URL,
} from "../../services/api";

import "./student.css";


export default function Forms() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    let ignore = false;

    api("/forms")
      .then((result) => {
        if (!ignore) {
          setDocs(result || []);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || "ไม่สามารถโหลดเอกสารได้");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);


  function docType(mimetype = "") {
    const type = mimetype.toLowerCase();

    if (type.includes("pdf")) {
      return {
        css: "pdf",
        label: "P",
      };
    }

    if (
      type.includes("sheet") ||
      type.includes("excel")
    ) {
      return {
        css: "xlsx",
        label: "X",
      };
    }

    if (
      type.includes("presentation") ||
      type.includes("powerpoint")
    ) {
      return {
        css: "pptx",
        label: "S",
      };
    }

    if (
      type.includes("word") ||
      type.includes("document")
    ) {
      return {
        css: "docx",
        label: "D",
      };
    }

    return {
      css: "file",
      label: "F",
    };
  }


  function getFileUrl(url) {
    if (!url) return "#";

    // ถ้า API ส่ง URL เต็มมาแล้ว
    if (
      url.startsWith("http://") ||
      url.startsWith("https://")
    ) {
      return url;
    }

    // ถ้าเป็น path เช่น /uploads/forms/xxx.pdf
    return `${FILE_BASE_URL}${url}`;
  }


  return (
    <div className="content">

      <PageTitle
        title="แบบฟอร์มต่าง ๆ"
        subtitle="เอกสารและแบบฟอร์มที่ใช้ระหว่างการฝึกงาน"
      />

      <Card
        title={`เอกสารดาวน์โหลด (${docs.length})`}
      >

        {/* Loading */}
        {loading && (
          <div className="empty">
            กำลังโหลด...
          </div>
        )}


        {/* Error */}
        {error && !loading && (
          <div className="empty">
            {error}
          </div>
        )}


        {/* ไม่มีเอกสาร */}
        {!loading &&
          !error &&
          docs.length === 0 && (
            <div className="empty">
              ยังไม่มีเอกสารที่อาจารย์อัปโหลด
            </div>
          )}


        {/* รายการเอกสาร */}
        {!loading &&
          !error &&
          docs.length > 0 && (
            <div className="doc-download-list">

              {docs.map((d) => {
                const type = docType(d.mimetype);
                const fileUrl = getFileUrl(d.url);

                return (
                  <div
                    className="doc-download-row"
                    key={d._id}
                  >

                    {/* Icon */}
                    <div
                      className={`doc-download-icon ${type.css}`}
                    >
                      {type.label}
                    </div>


                    {/* ข้อมูลไฟล์ */}
                    <div className="doc-download-info">
                      <b>
                        {d.title || d.originalName || "เอกสาร"}
                      </b>

                      <span>
                        {d.category || "เอกสารอื่น ๆ"}
                        {" · "}
                        {d.sizeLabel || ""}
                      </span>
                    </div>


                    {/* ปุ่มดาวน์โหลด */}
                    <a
                      className="doc-download-link"
                      href={fileUrl}
                      download={d.originalName || "document"}
                    >
                      ดาวน์โหลด ↓
                    </a>

                  </div>
                );
              })}

            </div>
          )}

      </Card>
    </div>
  );
}