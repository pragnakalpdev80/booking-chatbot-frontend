import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatMessage = ({ role, content }) => {
  return (
    <div className={`message-wrapper ${role}`}>
      <div className="message-bubble">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default ChatMessage;
