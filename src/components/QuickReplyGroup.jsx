import React, { useState } from "react";

const QuickReplyGroup = ({ messageContent, onReply, disabled }) => {
  const [clicked, setClicked] = useState(false);

  if (!messageContent) return null;

  const timeRangeRegex =
    /\b((?:1[0-2]|0?[1-9]):[0-5][0-9]\s*(?:AM|PM|am|pm))\s*[-–—]\s*((?:1[0-2]|0?[1-9]):[0-5][0-9]\s*(?:AM|PM|am|pm))\b/g;
  const timeRegex = /\b((?:1[0-2]|0?[1-9]):[0-5][0-9]\s*(?:AM|PM|am|pm))\b/g;

  const options = new Set();

  // Find time ranges
  let match;
  while ((match = timeRangeRegex.exec(messageContent)) !== null) {
    options.add(match[0].trim());
  }

  // If no time ranges, find single times
  if (options.size === 0) {
    while ((match = timeRegex.exec(messageContent)) !== null) {
      options.add(match[0].trim());
    }
  }

  // Extract simple bullet points
  const lines = messageContent.split("\n");
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const option = trimmed
        .substring(2)
        .replace(/^\[(.*)\]$/, "$1")
        .trim();
      if (option.length < 60 && !option.includes("**") && !option.includes("http")) {
        options.add(option);
      }
    }
  });

  // Basic Intents
  const normalized = messageContent.toLowerCase();
  if (
    normalized.includes("yes or no") ||
    normalized.includes("would you like to proceed") ||
    normalized.includes("do you want to confirm")
  ) {
    options.add("Yes");
    options.add("No");
  } else if (
    normalized.includes("cancel") &&
    normalized.includes("reschedule") &&
    normalized.includes("book")
  ) {
    options.add("Book");
    options.add("Reschedule");
    options.add("Cancel");
  }

  const finalOptions = Array.from(options);

  if (finalOptions.length === 0) return null;

  const handleOptionClick = (opt) => {
    if (disabled || clicked) return;
    setClicked(true);
    onReply(opt);
  };

  return (
    <div className="quick-reply-group flex flex-wrap gap-2 mt-2">
      {finalOptions.map((opt) => (
        <button
          key={opt}
          type="button"
          className="chat-option-btn"
          disabled={disabled || clicked}
          onClick={() => handleOptionClick(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

export default QuickReplyGroup;
