"use client";

import { useState } from "react";

type FeedbackStatus =
  | "idle"
  | "reviewing"
  | "feedback_good"
  | "feedback_revision"
  | "done";

type ExerciseTextCardProps = {
  prompt: string;
  placeholder?: string;
  maxLength?: number;
  aiFeedbackContext?: "valued_direction" | "obstacle" | "key_action";
  onSubmit?: (response: string) => void;
};

export function ExerciseTextCard({
  prompt,
  placeholder,
  maxLength,
  aiFeedbackContext,
  onSubmit,
}: ExerciseTextCardProps) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<FeedbackStatus>("idle");
  const [aiFeedback, setAiFeedback] = useState("");

  async function handleSubmit() {
    if (!value.trim()) return;
    onSubmit?.(value);

    if (!aiFeedbackContext) {
      setStatus("done");
      return;
    }

    setStatus("reviewing");

    try {
      const res = await fetch("/api/ai/exercise-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: value, context: aiFeedbackContext }),
      });

      if (!res.ok) {
        setStatus("done");
        return;
      }

      const data = await res.json() as { verdict: "good" | "needs_revision"; feedback: string };

      setAiFeedback(data.feedback);
      setStatus(data.verdict === "needs_revision" ? "feedback_revision" : "feedback_good");
    } catch {
      setStatus("done");
    }
  }

  function handleRevise() {
    setValue("");
    setAiFeedback("");
    setStatus("idle");
  }

  const isDisabled = status !== "idle";

  return (
    <div className="w-full bg-white px-6 py-8 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <h3 className="font-heading text-xl font-bold text-primary">{prompt}</h3>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder ?? "Skriv ditt svar här..."}
          maxLength={maxLength}
          disabled={isDisabled}
          rows={5}
          className="mt-4 w-full rounded-lg border-2 border-primary bg-[#E8EEF5] px-4 py-3 text-base text-navy placeholder-charcoal/50 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        />

        {/* Initial submit */}
        {status === "idle" && (
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="mt-4 w-full rounded-full bg-primary py-3.5 font-heading text-sm font-bold text-white transition hover:bg-primary-hover disabled:opacity-40"
          >
            Skicka svar
          </button>
        )}

        {/* Reviewing */}
        {status === "reviewing" && (
          <div className="mt-4 flex items-center gap-3 text-sm text-charcoal">
            <svg
              className="h-4 w-4 animate-spin text-primary"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Analyserar ditt svar...
          </div>
        )}

        {/* Good feedback */}
        {status === "feedback_good" && aiFeedback && (
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-success/10 px-4 py-3">
            <span className="mt-0.5 text-success" aria-hidden="true">✓</span>
            <p className="text-sm text-navy">{aiFeedback}</p>
          </div>
        )}
        {status === "feedback_good" && (
          <p className="mt-3 text-sm font-medium text-success">Svar sparat!</p>
        )}

        {/* Revision feedback */}
        {status === "feedback_revision" && (
          <>
            <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 border border-amber-200">
              <p className="text-sm text-navy">{aiFeedback}</p>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={handleRevise}
                className="w-full rounded-full bg-primary py-3.5 font-heading text-sm font-bold text-white transition hover:bg-primary-hover"
              >
                Ändra mitt svar
              </button>
              <button
                onClick={() => setStatus("done")}
                className="w-full py-2 text-sm text-charcoal/60 transition hover:text-charcoal"
              >
                Fortsätt ändå
              </button>
            </div>
          </>
        )}

        {/* Done (no AI or after "Fortsätt ändå") */}
        {status === "done" && (
          <p className="mt-3 text-sm font-medium text-success">Svar sparat!</p>
        )}
      </div>
    </div>
  );
}
