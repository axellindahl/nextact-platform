"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ONBOARDING_INITIAL_MESSAGE } from "@/lib/services/ai/onboarding-prompt";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "assistant" | "user";

interface Message {
  id: string;
  role: Role;
  content: string;
}

type Phase = "conversation" | "naming" | "submitting" | "error";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PROFIL_KLAR_PREFIX = "PROFIL_KLAR:";

function stripProfilKlar(text: string): string {
  return text.replace(PROFIL_KLAR_PREFIX, "").trimStart();
}

function hasProfilKlar(text: string): boolean {
  return text.includes(PROFIL_KLAR_PREFIX);
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Typing dots ─────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-charcoal/30 [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-charcoal/30 [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-charcoal/30" />
    </div>
  );
}

// ─── Message components ───────────────────────────────────────────────────────

function AssistantMessage({
  content,
  isFirst,
  isStreaming,
}: {
  content: string;
  isFirst: boolean;
  isStreaming?: boolean;
}) {
  const displayText = hasProfilKlar(content)
    ? stripProfilKlar(content)
    : content;

  return (
    <div className="flex flex-col gap-0.5">
      {isFirst && (
        <span className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-charcoal/35 font-heading">
          Programmet
        </span>
      )}
      <div className="border-l-2 border-primary/25 pl-4">
        <p
          className={`font-body text-[15px] leading-relaxed text-charcoal transition-opacity ${
            isStreaming ? "opacity-80" : "opacity-100"
          }`}
        >
          {displayText}
        </p>
      </div>
    </div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[78%] rounded-2xl rounded-br-sm bg-primary/[0.07] px-4 py-2.5">
        <p className="font-body text-[15px] leading-relaxed text-navy">
          {content}
        </p>
      </div>
    </div>
  );
}

// ─── Main client component ────────────────────────────────────────────────────

export function OnboardingClient() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: "assistant",
      content: ONBOARDING_INITIAL_MESSAGE,
    },
  ]);

  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("conversation");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Auto-scroll to bottom whenever messages or streaming content changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent, isStreaming]);

  // Focus input when phase changes back to conversation
  useEffect(() => {
    if (phase === "conversation" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase]);

  // Build message history for the API (excluding the initial assistant message
  // which is not part of the AI conversation — it's a static welcome line)
  function buildApiMessages(
    currentMessages: Message[]
  ): Array<{ role: Role; content: string }> {
    // The initial assistant message is pre-seeded UI — we skip it from API context
    // as the system prompt handles the opening context
    return currentMessages
      .slice(1) // skip the initial static message
      .map((m) => ({ role: m.role, content: m.content }));
  }

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming || phase !== "conversation") return;

    const sentText = text; // save before clearing

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: text,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const response = await fetch("/api/ai/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: buildApiMessages(updatedMessages),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Servern svarade med ett fel.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamingContent(accumulated);
      }

      // Stream complete — commit the final message
      const finalMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: accumulated,
      };

      setMessages((prev) => [...prev, finalMessage]);
      setStreamingContent("");
      setIsStreaming(false);

      // Check if we've reached the end of the conversation phase
      if (hasProfilKlar(accumulated)) {
        setPhase("naming");
      }
    } catch {
      // Roll back the user message so retry doesn't duplicate it
      setMessages(prev => {
        const lastUserIdx = [...prev].reverse().findIndex(m => m.role === "user");
        if (lastUserIdx === -1) return prev;
        const idx = prev.length - 1 - lastUserIdx;
        return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
      });
      setInput(sentText);
      setIsStreaming(false);
      setStreamingContent("");
      setPhase("error");
      setErrorMessage("Något gick fel. Försök skicka ditt meddelande igen.");
    }
  }, [input, isStreaming, messages, phase]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void sendMessage();
      }
    },
    [sendMessage]
  );

  const handleFinalize = useCallback(async () => {
    const name = characterName.trim();
    if (!name || phase !== "naming") return;

    setPhase("submitting");

    // Build full message history for finalize (excluding initial static message)
    const apiMessages = buildApiMessages(messages);

    try {
      const response = await fetch("/api/ai/onboarding/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          characterName: name,
        }),
      });

      if (!response.ok) {
        throw new Error("Finalize failed");
      }

      router.push("/learn");
    } catch {
      setPhase("error");
      setErrorMessage(
        "Det gick inte att spara din profil just nu. Prova igen."
      );
    }
  }, [characterName, messages, phase, router]);

  // The "visible" last assistant message index for streaming awareness
  const lastAssistantIndex = messages
    .map((m, i) => (m.role === "assistant" ? i : -1))
    .filter((i) => i !== -1)
    .at(-1);

  return (
    <div className="flex h-dvh flex-col bg-white">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex-none border-b border-navy/8 bg-white px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <span className="font-heading text-[15px] font-bold tracking-tight text-navy">
            Next Act
          </span>
          <span className="font-body text-xs text-charcoal/50">
            Steg 1 av 1: Skapa din karaktär
          </span>
        </div>
      </header>

      {/* ── Conversation area ───────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-8 sm:px-8"
      >
        <div className="mx-auto max-w-2xl space-y-6">
          {messages.map((message, index) => {
            if (message.role === "assistant") {
              // Show "Programmet" label only above the very first assistant message
              const isFirst = index === 0 && message.role === "assistant";
              return (
                <AssistantMessage
                  key={message.id}
                  content={message.content}
                  isFirst={isFirst}
                  isStreaming={false}
                />
              );
            }
            return <UserMessage key={message.id} content={message.content} />;
          })}

          {/* Streaming in-progress assistant message */}
          {isStreaming && streamingContent && (
            <AssistantMessage
              key="streaming"
              content={streamingContent}
              isFirst={lastAssistantIndex === undefined}
              isStreaming={true}
            />
          )}

          {/* Waiting dots — shown after user sends, before first chunk */}
          {isStreaming && !streamingContent && (
            <div className="border-l-2 border-primary/25 pl-4">
              <TypingDots />
            </div>
          )}

          {/* ── Error inline ──────────────────────────────────── */}
          {phase === "error" && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
              <p className="font-body text-sm text-red-700">{errorMessage}</p>
              <button
                onClick={() => {
                  setPhase("conversation");
                  setErrorMessage("");
                }}
                className="mt-2 font-body text-sm font-semibold text-red-600 underline underline-offset-2 hover:text-red-800"
              >
                Prova igen
              </button>
            </div>
          )}

          {/* ── Character naming card ─────────────────────────── */}
          {phase === "naming" && (
            <div className="mt-4 rounded-2xl border border-navy/8 bg-off-white px-6 py-7">
              <h2 className="font-heading text-base font-bold text-navy">
                Ge din karaktär ett namn
              </h2>
              <p className="mt-1 font-body text-sm text-charcoal/60">
                Det här är din alter ego i programmet — välj vad du vill.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleFinalize();
                  }}
                  placeholder="T.ex. Järnviljaren, Maja..."
                  autoFocus
                  maxLength={60}
                  className="flex-1 rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-charcoal placeholder:text-charcoal/35 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={() => void handleFinalize()}
                  disabled={!characterName.trim()}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-heading text-sm font-semibold text-white transition-all hover:-translate-y-px hover:bg-primary-hover hover:shadow-md disabled:pointer-events-none disabled:opacity-40"
                >
                  Starta mitt program →
                </button>
              </div>
            </div>
          )}

          {/* ── Submitting state ──────────────────────────────── */}
          {phase === "submitting" && (
            <div className="flex items-center gap-3 px-1 py-2">
              <TypingDots />
              <span className="font-body text-sm text-charcoal/50">
                Skapar ditt program...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky input bar ────────────────────────────────────── */}
      {phase === "conversation" || phase === "error" ? (
        <div className="flex-none border-t border-navy/8 bg-white px-5 py-4 sm:px-8">
          <div className="mx-auto max-w-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage();
              }}
              className="flex gap-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Skriv här..."
                disabled={isStreaming || phase === "error"}
                autoComplete="off"
                className="flex-1 rounded-full border border-navy/15 bg-off-white px-5 py-3 font-body text-sm text-charcoal placeholder:text-charcoal/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isStreaming || !input.trim() || phase === "error"}
                className="inline-flex items-center justify-center rounded-full bg-navy px-5 py-3 font-heading text-xs font-semibold tracking-wide text-white transition-all hover:-translate-y-px hover:shadow-md hover:shadow-navy/15 disabled:pointer-events-none disabled:opacity-40"
              >
                Skicka
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
