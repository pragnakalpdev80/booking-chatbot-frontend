import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import QuickReplyGroup from "./QuickReplyGroup";
import PaymentCard from "./PaymentCard";

const ChatMessage = ({ role, content, onReply, disabled, isTyping }) => {
  // Extract slots: [SLOT: 2026-07-27 09:00]
  const slotRegex = /\[SLOT:\s*([^\]]+)\]/g;
  const slots = [];
  let match;

  while ((match = slotRegex.exec(content)) !== null) {
    slots.push(match[1].trim());
  }

  // Extract pay: [PAY: mock_ord_123 | http://...]
  const payRegex = /\[PAY:\s*([^|\]]+)\|\s*([^\]]+)\]/g;
  let payInfo = null;
  const payMatch = payRegex.exec(content);
  if (payMatch) {
    payInfo = {
      orderId: payMatch[1].trim(),
      paymentUrl: payMatch[2].trim(),
    };
  }

  // Remove the raw tags from the text rendered to the user
  const displayContent = content.replace(slotRegex, "").replace(payRegex, "").trim();

  return (
    <div className={`message-wrapper ${role}`}>
      <div className="message-bubble">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>

        {role === "assistant" && (
          <QuickReplyGroup
            messageContent={content}
            parsedSlots={slots}
            onReply={onReply}
            disabled={disabled || isTyping}
          />
        )}

        {role === "assistant" && payInfo && (
          <PaymentCard orderId={payInfo.orderId} paymentUrl={payInfo.paymentUrl} />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
