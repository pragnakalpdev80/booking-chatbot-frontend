import React, { useState } from "react";

const QuickReplyGroup = ({ messageContent, parsedSlots, onReply, disabled, options }) => {
  const [clicked, setClicked] = useState(false);

  // Suppress ALL quick replies once the payment card has been triggered.
  // The [PAY: tag signals payment is in progress — no other user action is needed.
  if (messageContent?.includes("[PAY:")) return null;

  // If explicit options are passed (e.g. initial greeting), render them directly.
  if (options && options.length > 0) {
    return (
      <div
        className="quick-reply-group"
        style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className="chat-option-btn"
            disabled={disabled || clicked}
            onClick={() => { if (disabled || clicked) return; setClicked(true); onReply(opt.value); }}
            style={{ margin: 0 }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  // Fallback intents if no slots are present
  const getFallbackOptions = () => {
    const options = new Set();
    const normalized = messageContent ? messageContent.toLowerCase() : "";
    if (
      normalized.includes("yes or no") ||
      normalized.includes("would you like to proceed") ||
      normalized.match(/\bshall i (go ahead and )?confirm\b/)
    ) {
      options.add("Yes");
      options.add("No");
    } else if (
      (normalized.includes("cancel") &&
        normalized.includes("reschedule") &&
        normalized.includes("book")) ||
      // Initial greeting pattern: asking about what user would like to do
      (normalized.includes("what would you like") &&
        (normalized.includes("book") || normalized.includes("schedule")))
    ) {
      options.add("📅 Book an appointment");
      options.add("🔄 Reschedule an appointment");
      options.add("❌ Cancel an appointment");
    } else if (
      normalized.includes("reason") &&
      !normalized.includes("payment") &&
      !normalized.includes("slot is locked")
    ) {
      // Only show reason quick replies if we are genuinely asking for a reason
      // (not in a payment confirmation or slot-locked message)
      options.add("Follow-up");
      options.add("Consultation");
    }
    return Array.from(options);
  };

  const handleOptionClick = (opt) => {
    if (disabled || clicked) return;
    setClicked(true);
    onReply(opt);
  };

  if (parsedSlots && parsedSlots.length > 0) {
    const groupedSlots = {};
    parsedSlots.forEach((slotStr) => {
      // Handle "YYYY-MM-DD HH:MM" or "YYYY-MM-DDTHH:MM" or just anything the LLM outputs
      const parts = slotStr.trim().split(/[\sT]+/);
      const datePart = parts[0];
      // If there's a time part, use it; otherwise just use the whole string as the button
      const timePart = parts.length > 1 ? parts.slice(1).join(" ") : slotStr;

      if (!groupedSlots[datePart]) {
        groupedSlots[datePart] = [];
      }
      // Store the original slotStr so the button can send exactly what the LLM expects
      groupedSlots[datePart].push({ label: timePart, value: slotStr });
    });

    const formatHeader = (dateStr) => {
      try {
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
      } catch {
        return dateStr;
      }
    };

    return (
      <div className="quick-reply-slots" style={{ marginTop: "1rem" }}>
        {Object.entries(groupedSlots).map(([date, times]) => (
          <div key={date} style={{ marginBottom: "1rem" }}>
            <h4
              style={{ color: "var(--brand-primary)", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600" }}
            >
              {formatHeader(date)}
            </h4>
            <div
              style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
            >
              {times.map((timeObj, idx) => (
                <button
                  key={`${date}-${idx}`}
                  type="button"
                  className="chat-option-btn slot-btn"
                  disabled={disabled || clicked}
                  onClick={() => handleOptionClick(timeObj.value)}
                  style={{ margin: 0 }}
                >
                  {timeObj.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Fallback to basic intents
  const fallbackOptions = getFallbackOptions();
  if (fallbackOptions.length === 0) return null;

  return (
    <div
      className="quick-reply-group mt-3"
      style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}
    >
      {fallbackOptions.map((opt) => (
        <button
          key={opt}
          type="button"
          className="chat-option-btn"
          disabled={disabled || clicked}
          onClick={() => handleOptionClick(opt)}
          style={{ margin: 0 }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

export default QuickReplyGroup;
