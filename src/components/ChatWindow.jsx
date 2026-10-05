import { useEffect, useRef, useState } from "react";

function fmtTime(value) {
  if (!value) return "";

  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";

    return d.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function fmtDayLabel(value) {
  if (!value) return "";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return "วันนี้";
  if (isYesterday) return "เมื่อวาน";

  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ChatWindow({
  messages = [],
  currentRole,
  onSend,
  loading = false,
  sending = false,
  emptyText = "เริ่มต้นการสนทนาได้เลย",
  disabled = false,
  disabledText = "",
}) {
  const [text, setText] = useState("");
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  function handleSubmit(e) {
    e.preventDefault();

    const value = text.trim();
    if (!value || sending || disabled) return;

    onSend(value);
    setText("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  function handleChange(e) {
    setText(e.target.value);

    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }

  let lastDay = "";

  return (
    <div className="chat-window">
      <div className="chat-messages" ref={scrollRef}>
        {loading && (
          <div className="chat-loading">กำลังโหลดข้อความ...</div>
        )}

        {!loading && !messages.length && (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <p>{emptyText}</p>
          </div>
        )}

        {!loading &&
          messages.map((m, i) => {
            const mine = m.sender === currentRole;
            const dayKey = fmtDayLabel(m.createdAt);
            const showDay = dayKey !== lastDay;
            lastDay = dayKey;

            return (
              <div key={m._id || i}>
                {showDay && (
                  <div className="chat-day-divider">
                    <span>{dayKey}</span>
                  </div>
                )}

                <div
                  className={
                    mine ? "chat-bubble-row mine" : "chat-bubble-row"
                  }
                >
                  <div className="chat-bubble">
                    <p>{m.text}</p>
                    <small>{fmtTime(m.createdAt)}</small>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <form className="chat-input-bar" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={
            disabled
              ? disabledText || "ไม่สามารถส่งข้อความได้"
              : "พิมพ์ข้อความ... (กด Enter เพื่อส่ง)"
          }
          value={text}
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />

        <button
          type="submit"
          className="chat-send-btn"
          disabled={disabled || sending || !text.trim()}
        >
          {sending ? "..." : "ส่ง ➤"}
        </button>
      </form>
    </div>
  );
}