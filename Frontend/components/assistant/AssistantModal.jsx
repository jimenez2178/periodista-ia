"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import Spinner from "../ui/Spinner";
import { sendAssistantMessage } from "../../services/assistant.service";

export default function AssistantModal({ open, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  if (!open) return null;

  function handleClose() {
    setMessages([]);
    setInput("");
    setError("");
    onClose();
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const historyForRequest = messages;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const reply = await sendAssistantMessage(text, historyForRequest);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 p-4 sm:items-end sm:justify-end sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[70vh] w-full max-w-sm flex-col rounded-brand bg-white shadow-lg sm:h-[600px]"
      >
        <div className="flex items-start justify-between border-b border-brand-border px-4 py-3">
          <div>
            <h2 className="font-bold text-brand-text">Asistente PeriodistaIA</h2>
            <p className="text-xs text-brand-text/60">Pregúntame cómo usar cualquier función</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar asistente"
            className="flex h-8 w-8 items-center justify-center text-brand-text/50 hover:text-brand-text"
          >
            <X size={20} />
          </button>
        </div>

        <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
          {messages.length === 0 && (
            <p className="text-sm text-brand-text/50">¡Hola! ¿En qué función te puedo ayudar hoy?</p>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`max-w-[85%] rounded-brand px-3 py-2 text-sm ${
                message.role === "user" ? "self-end bg-brand-blue text-white" : "self-start bg-brand-bg text-brand-text"
              }`}
            >
              {message.content}
            </div>
          ))}
          {loading && <Spinner className="self-start" />}
          {error && <p className="text-xs text-brand-error">{error}</p>}
        </div>

        <div className="flex items-center gap-2 border-t border-brand-border p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            disabled={loading}
            placeholder="Escribe tu pregunta..."
            className="flex-1 rounded-brand border border-brand-border px-3 py-2.5 text-sm text-brand-text outline-none focus:border-brand-blue disabled:bg-brand-bg"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            aria-label="Enviar mensaje"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-brand bg-brand-blue text-white transition-colors hover:bg-brand-blue/90 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
