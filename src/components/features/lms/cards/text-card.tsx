"use client";

import { motion } from "framer-motion";

type TextCardProps = {
  title?: string;
  content: string;
};

export function TextCard({ title, content }: TextCardProps) {
  return (
    <div className="flex h-dvh items-center justify-center bg-off-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto w-full max-w-2xl"
      >
        {title && (
          <h2 className="mb-6 font-heading text-2xl font-bold text-navy md:text-3xl">
            {title}
          </h2>
        )}
        <div className="space-y-4 text-lg leading-relaxed text-charcoal">
          {content.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
