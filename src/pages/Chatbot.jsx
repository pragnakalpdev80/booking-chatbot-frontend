import React, { useState, useEffect, useRef } from "react";
import ChatMessage from "../components/ChatMessage";
import TypingIndicator from "../components/TypingIndicator";
import { useNavigate } from "react-router-dom";

const API_BASE = "/api/v1";

function Chatbot() {
  const navigate = useNavigate();
  const [selectedProvider] = useState(() => sessionStorage.getItem("selectedProvider") || null);
  const [sessionKey, setSessionKey] = useState(() => sessionStorage.getItem("sessionKey") || null);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem("chatMessages");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Start session on mount
  useEffect(() => {
    const startSession = async () => {
      if (!selectedProvider) return; // Wait until provider is selected
      if (sessionKey) return; // Do not start a new session if one is already active in sessionStorage

      try {
        const response = await fetch(`${API_BASE}/chat/sessions/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ provider_id: selectedProvider }),
        });
        if (!response.ok) throw new Error("Failed to start session");

        const data = await response.json();
        const newSessionKey = data.data.session_key;
        setSessionKey(newSessionKey);
        sessionStorage.setItem("sessionKey", newSessionKey);

        // Initial greeting
        const initialMessages = [
          {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now(),
            role: "assistant",
            content: "Hello! I am your AI scheduling assistant. How can I help you today?",
          },
        ];
        setMessages(initialMessages);
        sessionStorage.setItem("chatMessages", JSON.stringify(initialMessages));
      } catch (err) {
        console.error(err);
        setError("Could not connect to the server. Is Django running?");
      }
    };

    startSession();
  }, [selectedProvider, sessionKey]);

  const handleSend = async (textOverride) => {
    const userMessage = (typeof textOverride === "string" ? textOverride : inputValue).trim();
    if (!userMessage || !sessionKey || isTyping) return;

    if (typeof textOverride !== "string") {
      setInputValue("");
    }
    setError(null);

    // Add user message to UI
    setMessages((prev) => {
      const newMsgs = [
        ...prev,
        {
          id: crypto.randomUUID ? crypto.randomUUID() : Date.now(),
          role: "user",
          content: userMessage,
        },
      ];
      sessionStorage.setItem("chatMessages", JSON.stringify(newMsgs));
      return newMsgs;
    });
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE}/chat/message/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_key: sessionKey,
          message: userMessage,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      setMessages((prev) => {
        const newMsgs = [
          ...prev,
          {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now(),
            role: "assistant",
            content: data.data.response,
          },
        ];
        sessionStorage.setItem("chatMessages", JSON.stringify(newMsgs));
        return newMsgs;
      });
    } catch (err) {
      console.error(err);
      setError("An error occurred while sending the message.");
      // Remove the typing indicator if error
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID ? crypto.randomUUID() : Date.now(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // Main render logic
  useEffect(() => {
    if (!selectedProvider) {
      navigate("/");
    }
  }, [selectedProvider, navigate]);

  if (!selectedProvider) {
    return null;
  }

  return (
    <div className="chat-landing-wrapper" style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: "1.5rem", right: "2rem" }}>
        <a
          href="/provider/login"
          className="btn-secondary"
          style={{
            textDecoration: "none",
            background: "transparent",
            borderColor: "var(--brand-primary)",
            color: "var(--brand-primary)",
          }}
        >
          Provider Login
        </a>
      </div>
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-header-avatar">
            <img
              src="https://ui-avatars.com/api/?name=AI&background=4F46E5&color=ffffff"
              alt="Bot Avatar"
            />
            <div className="status-dot"></div>
          </div>
          <div className="chat-header-info">
            <h1>Booking Assistant</h1>
            <p>Ready to schedule your appointment</p>
          </div>
        </div>

        <div className="messages-area">
          {messages.map((msg, index) => {
            const isLastAssistantMessage =
              msg.role === "assistant" && index === messages.length - 1;
            return (
              <React.Fragment key={msg.id}>
                <ChatMessage
                  role={msg.role}
                  content={msg.content}
                  onReply={handleSend}
                  disabled={!isLastAssistantMessage || isTyping}
                  isTyping={isTyping}
                />
              </React.Fragment>
            );
          })}
          {isTyping && <TypingIndicator />}
          {error && (
            <div className="message-wrapper assistant">
              <div
                className="message-bubble"
                style={{ color: "#EF4444", borderColor: "#FCA5A5", background: "#FEF2F2" }}
              >
                {error}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={!sessionKey || isTyping}
          />
          <button
            type="button"
            className="send-btn"
            onClick={handleSend}
            disabled={!inputValue.trim() || !sessionKey || isTyping}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
