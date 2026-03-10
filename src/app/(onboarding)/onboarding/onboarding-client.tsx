"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ONBOARDING_INITIAL_MESSAGE } from "@/lib/services/ai/onboarding-prompt";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "conversation" | "naming" | "submitting" | "error";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PROFIL_KLAR_PREFIX = "PROFIL_KLAR:";

function stripProfilKlar(text: string): string {
  return text.replace(PROFIL_KLAR_PREFIX, "").trimStart();
}

function hasProfilKlar(text: string): boolean {
  return text.includes(PROFIL_KLAR_PREFIX);
}

function getMessageText(message: UIMessage): string {
  return message.parts.filter(isTextUIPart).map((p) => p.text).join("");
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

  const [phase, setPhase] = useState<Phase>("conversation");
  const [characterName, setCharacterName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/onboarding",
      prepareSendMessagesRequest: ({ messages: uiMessages }) => ({
        body: {
          messages: uiMessages
            .slice(1) // skip initial static assistant greeting
            .map((m) => ({
              role: m.role,
              content: getMessageText(m),
            })),
        },
      }),
    }),
    messages: [
      {
        id: "initial",
        role: "assistant" as const,
        parts: [{ type: "text" as const, text: ONBOARDING_INITIAL_MESSAGE }],
      },
    ],
    onFinish: ({ message }) => {
      if (hasProfilKlar(getMessageText(message))) {
        setPhase("naming");
      }
    },
    onError: (err) => {
      setPhase("error");
      setErrorMessage(err.message || "Något gick fel. Försök igen.");
    },
  });

  const isStreaming = status === "streaming" || status === "submitted";

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // Focus input when phase changes back to conversation
  useEffect(() => {
    if (phase === "conversation" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase]);

  // Show error from useChat
  useEffect(() => {
    if (error) {
      setPhase("error");
      setErrorMessage(error.message || "Något gick fel. Försök igen.");
    }
  }, [error]);

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text || isStreaming || phase === "error") return;
      void sendMessage({ text });
      setInput("");
    },
    [input, isStreaming, phase, sendMessage],
  );

  const handleFinalize = useCallback(async () => {
    const name = characterName.trim();
    if (!name || phase !== "naming") return;

    setPhase("submitting");

    const apiMessages = messages
      .slice(1) // skip initial static message
      .map((m) => ({ role: m.role, content: getMessageText(m) }));

    try {
      const response = await fetch("/api/ai/onboarding/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, characterName: name }),
      });

      if (!response.ok) throw new Error("Finalize failed");
      router.push("/learn");
    } catch {
      setPhase("error");
      setErrorMessage("Det gick inte att spara din profil just nu. Prova igen.");
    }
  }, [characterName, messages, phase, router]);

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
              const isFirst = index === 0;
              const isStreamingThis = isStreaming && index === lastAssistantIndex;
              return (
                <AssistantMessage
                  key={message.id}
                  content={getMessageText(message)}
                  isFirst={isFirst}
                  isStreaming={isStreamingThis}
                />
              );
            }
            return <UserMessage key={message.id} content={getMessageText(message)} />;
          })}

          {/* Waiting dots — shown after user sends, before first chunk */}
          {isStreaming && (
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
      {(phase === "conversation" || phase === "error") && (
        <div className="flex-none border-t border-navy/8 bg-white px-5 py-4 sm:px-8">
          <div className="mx-auto max-w-2xl">
            <form onSubmit={handleFormSubmit} className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
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
      )}
    </div>
  );
}
