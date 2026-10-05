import { useState } from "react";

import { api } from "../../../services/api";

import PageTitle from "../../../components/PageTitle";
import ChatWindow from "../../../components/ChatWindow";
import "../../../styles/chat.css";
import "../../student/student.css";
import "./mentor.css";

const SUGGESTIONS = [
  "ความคืบหน้าตอนนี้เป็นยังไงบ้าง",
  "ตอนนี้มีความเสี่ยงอะไรไหม",
  "ควรทำอะไรต่อ",
  "รายงานค้างอยู่ไหม",
];

/**
 * 🤖 AI Internship Mentor
 * ผู้ช่วย AI แบบ rule-based ที่ตอบคำถามโดยอ้างอิงข้อมูลจริงของนักศึกษา
 * (Progress / Risk / Recommendations) ไม่ต้องพึ่งพา LLM ภายนอก
 */
export default function Mentor({ user }) {
  const studentId = user?.studentId || user?.username;

  const [messages, setMessages] = useState([
    {
      sender: "mentor",
      text:
        "สวัสดีครับ 🤖 ผมคือ AI Internship Mentor ผู้ช่วยส่วนตัวของคุณ ลองถามเกี่ยวกับความคืบหน้า ความเสี่ยง หรือสิ่งที่ควรทำต่อได้เลยครับ",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSend(text) {
    if (!studentId) return;

    const userMsg = { sender: "student", text, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);
    setError("");

    try {
      const result = await api(`/intelligence/mentor/${studentId}`, {
        method: "POST",
        body: JSON.stringify({ question: text }),
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "mentor",
          text: result?.reply || "ขออภัยครับ ตอบคำถามนี้ไม่ได้ในขณะนี้",
          createdAt: result?.askedAt || new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(err.message || "ไม่สามารถติดต่อผู้ช่วย AI ได้");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="dashboard-page mentor-page">
      <PageTitle
        title="🤖 AI Internship Mentor"
        subtitle="ผู้ช่วย AI ที่วิเคราะห์ข้อมูลจริงของคุณเพื่อให้คำแนะนำเฉพาะบุคคล"
      />

      <div className="mentor-suggestions">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className="mentor-suggestion-chip"
            disabled={sending}
            onClick={() => handleSend(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <p style={{ color: "#e5484d", fontSize: 13, marginBottom: 8 }}>{error}</p>}

      <div className="mentor-chat-wrap">
        <ChatWindow
          messages={messages}
          currentRole="student"
          onSend={handleSend}
          sending={sending}
          emptyText="เริ่มต้นสนทนากับ AI Mentor ได้เลย"
        />
      </div>
    </div>
  );
}
