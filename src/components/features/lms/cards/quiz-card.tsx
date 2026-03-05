"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type QuizOption = {
  id: string;
  label: string;
  correct: boolean;
};

type QuizCardProps = {
  question: string;
  options: QuizOption[];
  explanation: string;
  onAnswer: (selectedId: string, isCorrect: boolean) => void;
};

export function QuizCard({
  question,
  options,
  explanation,
  onAnswer,
}: QuizCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  function handleSelect(id: string) {
    if (revealed) return;
    setSelectedId(id);
  }

  function handleSubmit() {
    if (!selectedId) return;
    setRevealed(true);
    const option = options.find((o) => o.id === selectedId);
    onAnswer(selectedId, option?.correct ?? false);
  }

  function optionStyle(option: QuizOption): string {
    if (!revealed) {
      return selectedId === option.id
        ? "bg-primary text-white shadow-sm shadow-primary/20"
        : "border border-light-gray bg-white text-navy hover:border-primary/40";
    }
    if (option.correct) {
      return "bg-success/15 border-2 border-success text-navy";
    }
    if (selectedId === option.id && !option.correct) {
      return "bg-red-50 border-2 border-red-400 text-navy";
    }
    return "border border-light-gray bg-white text-navy opacity-60";
  }

  return (
    <div className="flex h-dvh items-center justify-center bg-off-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto flex w-full max-w-2xl flex-col gap-6"
      >
        <h2 className="font-heading text-xl font-bold text-navy md:text-2xl">
          {question}
        </h2>

        <div className="flex flex-col gap-3">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              disabled={revealed}
              className={`
                rounded-xl px-5 py-4 text-left text-base font-medium transition-all
                disabled:pointer-events-none
                ${optionStyle(option)}
              `}
            >
              <span className="flex items-center gap-3">
                {revealed && option.correct && (
                  <svg
                    className="h-5 w-5 shrink-0 text-success"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {revealed && selectedId === option.id && !option.correct && (
                  <svg
                    className="h-5 w-5 shrink-0 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {option.label}
              </span>
            </button>
          ))}
        </div>

        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="rounded-xl bg-white p-5"
          >
            <p className="text-sm font-semibold text-charcoal">Förklaring</p>
            <p className="mt-1 text-base leading-relaxed text-navy">
              {explanation}
            </p>
          </motion.div>
        )}

        {!revealed && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedId}
            className="self-end rounded-[3rem] bg-primary px-8 py-3 font-heading text-base font-semibold text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none"
          >
            Svara
          </button>
        )}
      </motion.div>
    </div>
  );
}
