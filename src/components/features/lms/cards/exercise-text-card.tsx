"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type ExerciseTextCardProps = {
  prompt: string;
  placeholder?: string;
  maxLength?: number;
  onSubmit: (response: string) => void;
};

export function ExerciseTextCard({
  prompt,
  placeholder = "Skriv ditt svar här...",
  maxLength = 2000,
  onSubmit,
}: ExerciseTextCardProps) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (value.trim().length === 0) return;
    setSubmitted(true);
    onSubmit(value.trim());
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
          {prompt}
        </h2>

        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, maxLength))}
            placeholder={placeholder}
            disabled={submitted}
            rows={6}
            className="w-full resize-none rounded-xl border border-light-gray bg-white p-4 text-lg text-navy placeholder:text-light-gray focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
          />
          <span className="absolute right-3 bottom-3 text-xs text-light-gray">
            {value.length}/{maxLength}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={value.trim().length === 0 || submitted}
          className="self-end rounded-[3rem] bg-primary px-8 py-3 font-heading text-base font-semibold text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitted ? "Skickat" : "Skicka"}
        </button>
      </motion.div>
    </div>
  );
}
