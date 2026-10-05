import { useCallback, useEffect, useRef, useState } from "react";

import PageTitle from "../../components/PageTitle";
import ChatWindow from "../../components/ChatWindow";

import { api } from "../../services/api";

import "../../styles/chat.css";

const POLL_MS = 4000;

export default function StudentChat({ user }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const pollRef = useRef(null);
  const studentId = user?.studentId || user?.username;

  const loadThread = useCallback(
    async (showLoading) => {
      if (!studentId) return;

      if (showLoading) setLoading(true);

      try {
        const list = await api(`/messages/${studentId}`);
        setMessages(list || []);
        setError("");
      } catch (e) {
        if (showLoading) setError(e.message || "ไม่สามารถโหลดข้อความได้");
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [studentId]
  );

  useEffect(() => {
    loadThread(true);

    pollRef.current = setInterval(() => {
      loadThread(false);
    }, POLL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  async function handleSend(text) {
    setSending(true);

    try {
      await api("/messages", {
        method: "POST",
        body: JSON.stringify({ text }),
      });

      await loadThread(false);
    } catch (e) {
      alert(e.message || "ส่งข้อความไม่สำเร็จ");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="content chat-page">
      <PageTitle
        title="แชทกับอาจารย์ที่ปรึกษา"
        subtitle="พูดคุยและสอบถามอาจารย์ที่ปรึกษาของคุณได้แบบเรียลไทม์"
      />

      <div className="chat-shell solo">
        <div className="chat-main">
          <div className="chat-header">
            <div className="chat-header-avatar">
              <span className="chat-online-dot" />
              อ
            </div>

            <div className="chat-header-info">
              <b>อาจารย์ที่ปรึกษา</b>
              <span>พร้อมให้คำปรึกษาระหว่างการฝึกงาน</span>
            </div>
          </div>

          {error && <div className="chat-error">{error}</div>}

          <ChatWindow
            messages={messages}
            currentRole="student"
            onSend={handleSend}
            loading={loading}
            sending={sending}
            emptyText="ยังไม่มีข้อความ ลองทักทายอาจารย์ที่ปรึกษาของคุณดูสิ"
          />
        </div>
      </div>
    </div>
  );
}