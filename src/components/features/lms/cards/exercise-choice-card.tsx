"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Option = {
  id: string;
  label: string;
};

type ExerciseChoiceCardProps = {
  question: string;
  options: Option[];
  allowMultiple?: boolean;
  onSubmit: (selectedIds: string[]) => void;
};

export function ExerciseChoiceCard({
  question,
  options,
  allowMultiple = false,
  onSubmit,
}: ExerciseChoiceCardProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  function toggle(id: string) {
    if (submitted) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  }

  function handleSubmit() {
    if (selected.size === 0) return;
    setSubmitted(true);
    onSubmit(Array.from(selected));
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

        {allowMultiple && (
          <p className="text-sm text-charcoal">
            Välj ett eller flera alternativ
          </p>
        )}

        <div className="flex flex-col gap-3">
          {options.map((option) => {
            const isSelected = selected.has(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggle(option.id)}
                disabled={submitted}
                className={`
                  rounded-xl px-5 py-4 text-left text-base font-medium transition-all
                  disabled:pointer-events-none
                  ${
                    isSelected
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "border border-light-gray bg-white text-navy hover:border-primary/40"
                  }
                `}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={selected.size === 0 || submitted}
          className="self-end rounded-[3rem] bg-primary px-8 py-3 font-heading text-base font-semibold text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitted ? "Skickat" : "Skicka"}
        </button>
      </motion.div>
    </div>
  );
}
