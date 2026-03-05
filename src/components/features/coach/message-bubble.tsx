import type { ReactNode } from "react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  isStreaming?: boolean;
}

function renderMarkdown(text: string): ReactNode[] {
  const lines = text.split("\n");
  const elements: ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (i > 0) {
      elements.push(<br key={`br-${i}`} />);
    }

    const parts = line.split(/(\*\*.+?\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={`${i}-${j}`}>{part.slice(2, -2)}</strong>;
      }
      if (line.startsWith("- ")) {
        return j === 0 ? `• ${part.slice(2)}` : part;
      }
      return part;
    });

    elements.push(<span key={`line-${i}`}>{rendered}</span>);
  }

  return elements;
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({
  role,
  content,
  timestamp,
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-white rounded-br-md"
              : "bg-off-white text-charcoal rounded-bl-md"
          }`}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">{content}</span>
          ) : (
            <span>{renderMarkdown(content)}</span>
          )}
          {isStreaming && (
            <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-charcoal/50" />
          )}
        </div>
        {timestamp && (
          <p
            className={`mt-1 text-[10px] text-charcoal/30 ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {formatTime(timestamp)}
          </p>
        )}
      </div>
    </div>
  );
}
