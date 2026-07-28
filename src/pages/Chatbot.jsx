import React, { useState, useEffect, useRef } from "react";
import ChatMessage from "../components/ChatMessage";
import TypingIndicator from "../components/TypingIndicator";
import { useNavigate, Link, useParams } from "react-router-dom";

const API_BASE = "/api/v1";

const sanitizeKey = (key) => (typeof key === "string" ? key.replace(/[^a-zA-Z0-9_-]/g, "") : "");
const sanitizeJSON = (data) =>
  JSON.stringify(data).replaceAll("<", "\\u003c").replaceAll(">", "\\u003e");

function Chatbot() {
  const navigate = useNavigate();
  const { providerSlug } = useParams();
  const [sessionKey, setSessionKey] = useState(() => {
    const savedSlug = sessionStorage.getItem("providerSlug");
    if (savedSlug && savedSlug !== providerSlug) {
      sessionStorage.removeItem("sessionKey");
      sessionStorage.removeItem("chatMessages");
      return null;
    }
    return sessionStorage.getItem("sessionKey") || null;
  });

  const [messages, setMessages] = useState(() => {
    const savedSlug = sessionStorage.getItem("providerSlug");
    if (savedSlug && savedSlug !== providerSlug) return [];
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const startSession = async () => {
      if (!providerSlug) return;

      // Update saved slug
      sessionStorage.setItem("providerSlug", providerSlug);

      if (sessionKey) return;

      try {
        // Resolve slug to provider_id
        const providerRes = await fetch(`${API_BASE}/chat/provider/${providerSlug}/`);
        if (!providerRes.ok) {
          setError("Provider not found. Please check the URL.");
          return;
        }
        const providerData = await providerRes.json();
        const pId = providerData.data.id;

        const response = await fetch(`${API_BASE}/chat/sessions/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ provider_id: pId }),
        });
        if (!response.ok) throw new Error("Failed to start session");

        const data = await response.json();
        const newSessionKey = sanitizeKey(data.data.session_key);
        setSessionKey(newSessionKey);
        // eslint-disable-next-line
        // oxlint-disable-next-line
        sessionStorage.setItem("sessionKey", newSessionKey);

        const greeting =
          data.data.greeting ||
          "Hello! I am your AI scheduling assistant. How can I help you today?";
        const greetingOptions = data.data.greeting_options || [];

        const initialMessages = [
          {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now(),
            role: "assistant",
            content: greeting,
            options: greetingOptions,
          },
        ];
        setMessages(initialMessages);
        // eslint-disable-next-line
        // oxlint-disable-next-line
        sessionStorage.setItem("chatMessages", sanitizeJSON(initialMessages));
      } catch (err) {
        console.error(err);
        setError("Could not connect to the server. Is Django running?");
      }
    };

    startSession();
  }, [providerSlug, sessionKey]);

  const handleSend = async (textOverride, hidden = false) => {
    const userMessage = (typeof textOverride === "string" ? textOverride : inputValue).trim();
    if (!userMessage || !sessionKey || isTyping) return;

    if (typeof textOverride !== "string") {
      setInputValue("");
    }
    setError(null);

    if (!hidden) {
      setMessages((prev) => {
        const newMsgs = [
          ...prev,
          {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now(),
            role: "user",
            content: userMessage,
          },
        ];
        // eslint-disable-next-line
        // oxlint-disable-next-line
        sessionStorage.setItem("chatMessages", sanitizeJSON(newMsgs));
        return newMsgs;
      });
    }
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
        // eslint-disable-next-line
        // oxlint-disable-next-line
        sessionStorage.setItem("chatMessages", sanitizeJSON(newMsgs));
        return newMsgs;
      });
    } catch (err) {
      console.error(err);
      setError("An error occurred while sending the message.");
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

  useEffect(() => {
    if (!providerSlug) {
      navigate("/");
    }
  }, [providerSlug, navigate]);

  if (!providerSlug) {
    return null;
  }

  return (
    <div className="chat-landing-wrapper" style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: "1.5rem", right: "2rem" }}>
        <Link
          to="/"
          className="btn btn-secondary"
          style={{ textDecoration: "none", marginRight: "1rem" }}
        >
          Change Provider
        </Link>
        <Link to="/provider/login" className="btn btn-ghost" style={{ textDecoration: "none" }}>
          Provider Login
        </Link>
      </div>

      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-header-profile">
            <div className="chat-header-avatar">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 8V4H8"></path>
                <rect x="4" y="8" width="16" height="12" rx="2"></rect>
                <path d="M2 14h2"></path>
                <path d="M20 14h2"></path>
                <path d="M15 13v2"></path>
                <path d="M9 13v2"></path>
              </svg>
              <div className="status-dot"></div>
            </div>
            <div className="chat-header-info">
              <h1>Booking Assistant</h1>
              <p>Ready to schedule your appointment</p>
            </div>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={() => navigate("/")}
            title="Close Chat"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
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
                  options={msg.options}
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
              <div className="message-bubble banner banner-error">{error}</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-wrapper">
            <input
              type="text"
              className="chat-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me to book an appointment..."
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
    </div>
  );
}

export default Chatbot;
