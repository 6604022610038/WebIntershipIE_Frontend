import { useCallback, useEffect, useRef, useState } from "react";

import PageTitle from "../../components/PageTitle";
import ChatWindow from "../../components/ChatWindow";
import Empty from "../../components/Empty";

import { api } from "../../services/api";

import "./advisor.css";
import "../../styles/chat.css";

const POLL_MS = 4000;

function fmtRelative(value) {
  if (!value) return "";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();

  if (isToday) {
    return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  }

  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

export default function AdvisorChat() {
  const [conversations, setConversations] = useState([]);
  const [convLoading, setConvLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [showingList, setShowingList] = useState(true);

  const [messages, setMessages] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const pollRef = useRef(null);

  const loadConversations = useCallback(async (showLoading) => {
    if (showLoading) setConvLoading(true);

    try {
      const list = await api("/messages/conversations");
      setConversations(list || []);
    } catch {
      // เงียบไว้ ไม่รบกวนผู้ใช้ระหว่าง polling
    } finally {
      if (showLoading) setConvLoading(false);
    }
  }, []);

  const loadThread = useCallback(async (studentId, showLoading) => {
    if (!studentId) return;

    if (showLoading) setThreadLoading(true);

    try {
      const list = await api(`/messages/${studentId}`);
      setMessages(list || []);
    } catch {
      // เงียบไว้
    } finally {
      if (showLoading) setThreadLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations(true);

    pollRef.current = setInterval(() => {
      loadConversations(false);
      if (activeId) loadThread(activeId, false);
    }, POLL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  function openConversation(studentId) {
    setActiveId(studentId);
    setShowingList(false);
    loadThread(studentId, true);

    setConversations((prev) =>
      prev.map((c) =>
        c.studentId === studentId ? { ...c, unreadCount: 0 } : c
      )
    );
  }

  async function handleSend(text) {
    if (!activeId) return;

    setSending(true);

    try {
      await api("/messages", {
        method: "POST",
        body: JSON.stringify({ studentId: activeId, text }),
      });

      await loadThread(activeId, false);
      await loadConversations(false);
    } catch (e) {
      alert(e.message || "ส่งข้อความไม่สำเร็จ");
    } finally {
      setSending(false);
    }
  }

  const filtered = conversations.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    return (
      c.name?.toLowerCase().includes(q) ||
      c.studentId?.toLowerCase().includes(q)
    );
  });

  const active = conversations.find((c) => c.studentId === activeId);

  return (
    <div className={`content chat-page${showingList ? " showing-list" : ""}`}>
      <PageTitle
        title="แชทกับนักศึกษา"
        subtitle="พูดคุยและติดตามนักศึกษาในความดูแลได้แบบเรียลไทม์"
      />

      <div className="chat-shell">
        <div className="chat-sidebar">
          <div className="chat-sidebar-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="ค้นหานักศึกษา..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="chat-conversation-list">
            {convLoading && (
              <div className="chat-loading">กำลังโหลด...</div>
            )}

            {!convLoading && !filtered.length && (
              <Empty text="ไม่พบนักศึกษา" />
            )}

            {!convLoading &&
              filtered.map((c) => (
                <button
                  type="button"
                  key={c.studentId}
                  className={
                    c.studentId === activeId
                      ? "chat-conversation-item active"
                      : "chat-conversation-item"
                  }
                  onClick={() => openConversation(c.studentId)}
                >
                  <div className="chat-conversation-avatar">
                    {c.name?.charAt(0) || "น"}
                  </div>

                  <div className="chat-conversation-info">
                    <div className="chat-conversation-top">
                      <b>{c.name || c.studentId}</b>
                      <small>{fmtRelative(c.lastMessageAt)}</small>
                    </div>

                    <p>
                      {c.lastSender === "advisor" && "คุณ: "}
                      {c.lastMessage || "ยังไม่มีข้อความ"}
                    </p>
                  </div>

                  {c.unreadCount > 0 && (
                    <span className="chat-unread-dot">{c.unreadCount}</span>
                  )}
                </button>
              ))}
          </div>
        </div>

        <div className="chat-main">
          {!activeId ? (
            <div className="chat-placeholder">
              <div className="chat-empty-icon">💬</div>
              <p>เลือกนักศึกษาทางด้านซ้ายเพื่อเริ่มสนทนา</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <button
                  type="button"
                  className="chat-back-btn"
                  onClick={() => setShowingList(true)}
                  aria-label="กลับไปที่รายชื่อ"
                >
                  ‹
                </button>

                <div className="chat-header-avatar">
                  {active?.name?.charAt(0) || "น"}
                </div>

                <div className="chat-header-info">
                  <b>{active?.name || activeId}</b>
                  <span>
                    {active?.position || "นักศึกษาฝึกงาน"}
                    {active?.company ? ` · ${active.company}` : ""}
                  </span>
                </div>
              </div>

              <ChatWindow
                messages={messages}
                currentRole="advisor"
                onSend={handleSend}
                loading={threadLoading}
                sending={sending}
                emptyText="ยังไม่มีข้อความกับนักศึกษาคนนี้"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}