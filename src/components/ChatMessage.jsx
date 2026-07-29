import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import QuickReplyGroup from "./QuickReplyGroup";
import PaymentCard from "./PaymentCard";

const ChatMessage = ({ role, content, options, onReply, disabled, isTyping }) => {
  // Extract slots — tolerant regex handles LLM drift:
  // Accepts: [SLOT: 2026-07-27 09:00], SLOT: 2026-07-27 09:00, [SLOT:2026-07-27 09:00], etc.
  const slotRegex =
    /\[\s*SLOT\s*:\s*(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2})[^\]]*\]|SLOT\s*:\s*(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2})/gi;
  const slots = [];
  let match;
  // Reset lastIndex before exec loop (safety for global regex reuse)
  slotRegex.lastIndex = 0;
  while ((match = slotRegex.exec(content)) !== null) {
    slots.push((match[1] || match[2]).trim());
  }

  // Extract pay: [PAY: mock_ord_123 | http://...]
  const payRegex = /\[PAY:([^|\]]+)\|([^\]]+)\]/g;
  let payInfo = null;
  const payMatch = payRegex.exec(content);
  if (payMatch) {
    payInfo = {
      orderId: payMatch[1].trim(),
      paymentUrl: payMatch[2].trim(),
    };
  }

  // Remove the raw slot tags from the text rendered to the user
  // Use a fresh regex instance with the same pattern (global flag requires a new exec context)
  const cleanSlotRegex =
    /\[\s*SLOT\s*:\s*\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}[^\]]*\]|SLOT\s*:\s*\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}/gi;
  const displayContent = content.replace(cleanSlotRegex, "").replace(payRegex, "").trim();

  return (
    <div className={`message-wrapper ${role}`}>
      <div className="message-bubble">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>

        {role === "assistant" && (
          <QuickReplyGroup
            messageContent={content}
            parsedSlots={slots}
            options={options}
            onReply={onReply}
            disabled={disabled || isTyping}
          />
        )}

        {role === "assistant" && payInfo && (
          <PaymentCard
            orderId={payInfo.orderId}
            onReply={onReply}
            disabled={disabled || isTyping}
          />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
