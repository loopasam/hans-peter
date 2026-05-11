"use client";

import {
  History,
  Loader2,
  MessageSquareText,
  Mic,
  Square,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RealtimeAgent, RealtimeSession } from "@openai/agents/realtime";

const DEFAULT_TOPIC = "daily conversation";

function tutorInstructions(level, correctionStyle) {
  const correctionRule =
    correctionStyle === "light"
      ? "Briefly correct only major mistakes during conversation, then continue naturally."
      : "Do not interrupt for corrections. Save corrections for the final feedback.";

  return [
    "You are Hans Peter, a warm German speaking tutor.",
    `Adapt your German to CEFR level ${level}.`,
    "Speak German by default. Use short English rescue phrases only if the learner is stuck.",
    "Keep replies short and ask one question at a time.",
    correctionRule,
    "Encourage full-sentence answers and keep the conversation moving.",
  ].join(" ");
}

function extractText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";

  return content
    .map((part) => part?.text ?? part?.transcript ?? "")
    .filter(Boolean)
    .join(" ")
    .trim();
}

function historyToMessages(history) {
  return (history ?? [])
    .map((item, index) => {
      const role = item.role === "assistant" ? "assistant" : item.role === "user" ? "user" : null;
      const text = extractText(item.content);
      if (!role || !text) return null;
      return {
        id: item.id ?? `${role}-${index}`,
        role,
        text,
        timestamp: new Date().toISOString(),
      };
    })
    .filter(Boolean);
}

function FeedbackView({ feedback }) {
  if (!feedback) return null;

  return (
    <section className="feedback" aria-label="Session feedback">
      <h2>Feedback</h2>
      <p>{feedback.summary}</p>
      <div className="feedback-grid">
        <div className="feedback-section">
          <h3>Strengths</h3>
          <ul>
            {feedback.strengths.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="feedback-section">
          <h3>Corrections</h3>
          <ul>
            {feedback.corrections.map((item, index) => (
              <li key={index}>
                {typeof item === "string"
                  ? item
                  : `${item.original ?? ""} -> ${item.corrected ?? ""}`}
              </li>
            ))}
          </ul>
        </div>
        <div className="feedback-section">
          <h3>Vocabulary</h3>
          <ul>
            {feedback.vocabulary.map((item, index) => (
              <li key={index}>{typeof item === "string" ? item : JSON.stringify(item)}</li>
            ))}
          </ul>
        </div>
        <div className="feedback-section">
          <h3>Next Practice</h3>
          <ul>
            {feedback.nextPractice.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function TutorApp() {
  const [level, setLevel] = useState("A2");
  const [topic, setTopic] = useState(DEFAULT_TOPIC);
  const [correctionStyle, setCorrectionStyle] = useState("after");
  const [status, setStatus] = useState("idle");
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [error, setError] = useState("");
  const sessionRef = useRef(null);
  const startedAtRef = useRef(null);

  async function loadSessions() {
    const response = await fetch("/api/sessions");
    if (response.ok) {
      setSessions(await response.json());
    }
  }

  async function viewSession(id) {
    setError("");
    setStatus("loading");

    try {
      const response = await fetch(`/api/sessions/${id}`);
      const session = await response.json();
      if (!response.ok) {
        throw new Error(session.error ?? "Could not load the session.");
      }

      sessionRef.current?.close();
      sessionRef.current = null;
      setSelectedSessionId(id);
      setMessages(session.messages ?? []);
      setFeedback(session.feedback ?? null);
      setLevel(session.level ?? "A2");
      setTopic(session.topic ?? DEFAULT_TOPIC);
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the session.");
      setStatus("idle");
    }
  }

  useEffect(() => {
    loadSessions().catch(() => {});
  }, []);

  async function startSession() {
    setError("");
    setFeedback(null);
    setMessages([]);
    setSelectedSessionId("");
    setStatus("connecting");
    startedAtRef.current = new Date().toISOString();

    try {
      const agent = new RealtimeAgent({
        name: "Hans Peter",
        instructions: tutorInstructions(level, correctionStyle),
      });
      const realtimeSession = new RealtimeSession(agent, {
        config: {
          audio: {
            output: {
              voice: "alloy",
            },
          },
        },
      });

      realtimeSession.on("history_updated", (history) => {
        setMessages(historyToMessages(history));
      });
      realtimeSession.on("history_added", () => {
        setMessages(historyToMessages(realtimeSession.history));
      });
      realtimeSession.on("audio_start", () => setStatus("speaking"));
      realtimeSession.on("audio_stopped", () => setStatus("listening"));
      realtimeSession.on("error", (event) => {
        setError(event?.message ?? "Realtime session error.");
        setStatus("idle");
      });

      await realtimeSession.connect({
        apiKey: async () => {
          const response = await fetch("/api/realtime/session", { method: "POST" });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error ?? "Could not create a Realtime session.");
          }
          return data.clientSecret;
        },
      });

      sessionRef.current = realtimeSession;
      setStatus("listening");
      realtimeSession.sendMessage(
        `Beginne eine kurze Deutsch-Uebung zum Thema "${topic}". Begruesse mich und stelle eine einfache Frage.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the session.");
      setStatus("idle");
    }
  }

  async function endSession() {
    setStatus("saving");
    setError("");

    try {
      sessionRef.current?.close();
      sessionRef.current = null;

      const saveResponse = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startedAt: startedAtRef.current,
          endedAt: new Date().toISOString(),
          level,
          topic,
          messages,
        }),
      });
      const saved = await saveResponse.json();
      if (!saveResponse.ok) {
        throw new Error(saved.error ?? "Could not save the session.");
      }

      setStatus("feedback");
      const feedbackResponse = await fetch(`/api/sessions/${saved.id}/feedback`, {
        method: "POST",
      });
      const updated = await feedbackResponse.json();
      if (!feedbackResponse.ok) {
        throw new Error(updated.error ?? "Could not generate feedback.");
      }

      setFeedback(updated.feedback);
      setSelectedSessionId(updated.id);
      await loadSessions();
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not end the session.");
      setStatus("idle");
    }
  }

  const isActive = ["connecting", "listening", "speaking"].includes(status);
  const isBusy = ["connecting", "saving", "feedback", "loading"].includes(status);

  return (
    <main className="app-shell">
      <section className="main">
        <header className="topbar">
          <div className="brand">
            <h1>Hans Peter</h1>
            <span>German speaking tutor</span>
          </div>
          <div className="controls">
            <div className="field">
              <label htmlFor="level">Level</label>
              <select
                id="level"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                disabled={isActive}
              >
                <option>A1</option>
                <option>A2</option>
                <option>B1</option>
                <option>B2</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="topic">Topic</label>
              <input
                id="topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                disabled={isActive}
              />
            </div>
            <div className="field">
              <label htmlFor="correction">Corrections</label>
              <select
                id="correction"
                value={correctionStyle}
                onChange={(event) => setCorrectionStyle(event.target.value)}
                disabled={isActive}
              >
                <option value="after">After session</option>
                <option value="light">Light during chat</option>
              </select>
            </div>
            {!isActive ? (
              <button className="primary" onClick={startSession} disabled={isBusy}>
                {status === "connecting" ? <Loader2 className="spin" size={18} /> : <Mic size={18} />}
                Start
              </button>
            ) : (
              <button className="danger" onClick={endSession}>
                <Square size={18} />
                End
              </button>
            )}
          </div>
        </header>

        <section className="conversation">
          <div className="session-header">
            <span className="status-pill">
              {isBusy && <Loader2 className="spin" size={16} />}
              {status}
            </span>
            <span className="status">{messages.length} transcript messages</span>
          </div>

          <div className="transcript" aria-live="polite">
            {messages.length === 0 ? (
              <div className="empty">
                <MessageSquareText size={20} />
                <span>Start a session when you are ready.</span>
              </div>
            ) : (
              messages.map((message) => (
                <article className={`message ${message.role}`} key={message.id}>
                  <strong>{message.role === "assistant" ? "Hans Peter" : "You"}</strong>
                  <p>{message.text}</p>
                </article>
              ))
            )}
          </div>

          <FeedbackView feedback={feedback} />
          {error && <div className="error">{error}</div>}
        </section>
      </section>

      <aside className="history">
        <h2>
          <History size={18} /> Sessions
        </h2>
        <div className="history-list">
          {sessions.length === 0 ? (
            <p className="status">No saved sessions yet.</p>
          ) : (
            sessions.map((session) => (
              <button
                className="history-item"
                disabled={isActive || selectedSessionId === session.id}
                key={session.id}
                onClick={() => viewSession(session.id)}
                type="button"
              >
                <strong>{session.topic}</strong>
                <span>
                  {session.level} - {session.messageCount} messages -{" "}
                  {session.hasFeedback ? "feedback ready" : "no feedback"}
                </span>
              </button>
            ))
          )}
        </div>
      </aside>
    </main>
  );
}
