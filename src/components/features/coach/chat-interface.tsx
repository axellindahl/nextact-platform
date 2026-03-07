"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useRef, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "./message-bubble";
import { ChatDisclaimer } from "./chat-disclaimer";

interface ChatInterfaceProps {
  conversationId?: string;
  lessonId?: string;
  remainingMessages?: number;
  rateLimitReached?: boolean;
}

function getTextContent(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");
}

export function ChatInterface({
  conversationId: initialConversationId,
  lessonId: initialLessonId,
  remainingMessages: initialRemaining,
  rateLimitReached: initialLimitReached = false,
}: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [remaining, setRemaining] = useState(initialRemaining);
  const [limitReached, setLimitReached] = useState(initialLimitReached);

  const searchParams = useSearchParams();
  const contextLessonId =
    initialLessonId ?? searchParams.get("context") ?? undefined;

  const [transport] = useState(
    () =>
      new TextStreamChatTransport({
        api: "/api/ai/chat",
        body: {
          conversationId: initialConversationId,
          lessonId: contextLessonId,
        },
      })
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

  const isStreaming = status === "streaming" || status === "submitted";
  const lastMessage = messages[messages.length - 1];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (error?.message.includes("Rate limit")) {
      setLimitReached(true);
    }
  }, [error]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming || limitReached) return;
    setInput("");
    sendMessage({ text });
    if (remaining !== undefined && remaining !== Infinity) {
      setRemaining(Math.max(0, remaining - 1));
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Safety disclaimer banner */}
      <ChatDisclaimer />

      {/* Chat panel header */}
      <div className="border-b border-navy/10 px-4 py-3">
        <h2 className="font-heading font-semibold text-charcoal">
          Ditt mentala bollplank
        </h2>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      >
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-heading font-semibold text-charcoal">
                Hej! Jag {"ä"}r ditt mentala bollplank.
              </p>
              <p className="mt-2 text-sm text-charcoal/60">
                St{"ä"}ll en fr{"å"}ga om mental tr{"ä"}ning,
                prestation eller n{"å"}got annat som r{"ö"}r din
                idrott.
              </p>
            </div>
          </div>
        )}

        {messages.map((message, index) => {
          const isLastAssistant =
            message.role === "assistant" &&
            index === messages.length - 1 &&
            isStreaming;

          return (
            <MessageBubble
              key={message.id}
              role={message.role as "user" | "assistant"}
              content={getTextContent(message.parts)}
              isStreaming={isLastAssistant}
            />
          );
        })}

        {isStreaming && lastMessage?.role === "user" && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-off-white px-4 py-3">
              <div className="flex space-x-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-charcoal/30 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-charcoal/30 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-charcoal/30" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error / rate limit display */}
      {limitReached && (
        <div className="mx-4 mb-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          <p className="font-medium">
            Du har n{"å"}tt din gr{"ä"}ns f{"ö"}r antal
            meddelanden.
          </p>
          <p className="mt-1 text-amber-700">
            Uppgradera f{"ö"}r fler meddelanden eller v{"ä"}nta tills
            din gr{"ä"}ns {"å"}terst{"ä"}lls.
          </p>
        </div>
      )}

      {error && !limitReached && (
        <div className="mx-4 mb-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          N{"å"}got gick fel. F{"ö"}rs{"ö"}k igen.
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-navy/10 bg-white px-4 py-3">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              limitReached
                ? "Meddelandegränsen nådd..."
                : "Skriv till ditt bollplank..."
            }
            className="flex-1 rounded-full border border-navy/15 bg-off-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            disabled={isStreaming || limitReached}
          />
          <Button
            type="submit"
            size="sm"
            disabled={isStreaming || !input.trim() || limitReached}
          >
            Skicka
          </Button>
        </form>

        {/* Remaining messages indicator */}
        {remaining !== undefined && remaining !== Infinity && !limitReached && (
          <p className="mt-2 text-center text-xs text-charcoal/40">
            {remaining} meddelande{remaining !== 1 ? "n" : ""} kvar
          </p>
        )}
      </div>
    </div>
  );
}
