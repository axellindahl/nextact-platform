"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type AiPromptCardProps = {
  prompt: string;
  lessonId: string;
};

export function AiPromptCard({ prompt, lessonId }: AiPromptCardProps) {
  return (
    <div className="flex h-dvh items-center justify-center bg-off-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto flex w-full max-w-md flex-col items-center gap-8 text-center"
      >
        {/* AI icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
          <svg
            className="h-10 w-10 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            <path d="M8 10h.01M12 10h.01M16 10h.01" />
          </svg>
        </div>

        <p className="text-lg leading-relaxed text-charcoal">{prompt}</p>

        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Link
            href={`/app/coach?context=${encodeURIComponent(lessonId)}`}
            className="inline-flex items-center rounded-[3rem] bg-primary px-8 py-4 font-heading text-lg font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30"
          >
            Öppna coachen
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
