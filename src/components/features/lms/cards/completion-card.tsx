"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type CompletionCardProps = {
  lessonTitle: string;
  timeSpentMinutes?: number;
  exercisesCompleted?: number;
  nextLessonHref?: string;
  moduleHref: string;
};

function Particle({ index }: { index: number }) {
  const angle = (index / 12) * Math.PI * 2;
  const distance = 80 + Math.random() * 40;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  const colors = ["#2670E6", "#4AD48C", "#1DBDD4", "#4582E4"];
  const color = colors[index % colors.length];
  const size = 4 + Math.random() * 4;

  return (
    <motion.span
      className="absolute left-1/2 top-1/2 rounded-full"
      style={{ width: size, height: size, backgroundColor: color }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
      animate={{ x, y, opacity: 0, scale: 1 }}
      transition={{
        duration: 1,
        delay: 0.3 + index * 0.04,
        ease: "easeOut",
      }}
      aria-hidden="true"
    />
  );
}

export function CompletionCard({
  lessonTitle,
  timeSpentMinutes,
  exercisesCompleted,
  nextLessonHref,
  moduleHref,
}: CompletionCardProps) {
  return (
    <div className="flex h-dvh items-center justify-center bg-off-white p-6">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 text-center">
        {/* Checkmark with particles */}
        <div className="relative">
          {Array.from({ length: 12 }, (_, i) => (
            <Particle key={i} index={i} />
          ))}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1,
            }}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-success/15"
          >
            <motion.svg
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="h-12 w-12 text-success"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <motion.path
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              />
            </motion.svg>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-2"
        >
          <h2 className="font-heading text-3xl font-bold text-navy">
            Bra jobbat!
          </h2>
          <p className="text-base text-charcoal">
            Du har slutfört &ldquo;{lessonTitle}&rdquo;
          </p>
        </motion.div>

        {/* Stats */}
        {(timeSpentMinutes !== undefined ||
          exercisesCompleted !== undefined) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex gap-8"
          >
            {timeSpentMinutes !== undefined && (
              <div>
                <p className="font-heading text-2xl font-bold text-navy">
                  {timeSpentMinutes}
                </p>
                <p className="text-xs text-charcoal">minuter</p>
              </div>
            )}
            {exercisesCompleted !== undefined && (
              <div>
                <p className="font-heading text-2xl font-bold text-navy">
                  {exercisesCompleted}
                </p>
                <p className="text-xs text-charcoal">övningar</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col gap-3"
        >
          {nextLessonHref && (
            <Link
              href={nextLessonHref}
              className="inline-flex items-center justify-center rounded-[3rem] bg-primary px-8 py-4 font-heading text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover"
            >
              Nästa lektion
            </Link>
          )}
          <Link
            href={moduleHref}
            className="inline-flex items-center justify-center rounded-[3rem] px-6 py-3 text-sm font-medium text-charcoal transition-colors hover:text-navy hover:bg-navy/5 font-heading"
          >
            Tillbaka till modulen
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
