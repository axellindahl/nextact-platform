"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { VideoCard } from "@/components/features/lms/cards/video-card";
import { TextCard } from "@/components/features/lms/cards/text-card";
import { ExerciseTextCard } from "@/components/features/lms/cards/exercise-text-card";
import { ExerciseChoiceCard } from "@/components/features/lms/cards/exercise-choice-card";
import { ExerciseSortingCard } from "@/components/features/lms/cards/exercise-sorting-card";
import { QuizCard } from "@/components/features/lms/cards/quiz-card";
import { CalloutCard } from "@/components/features/lms/cards/callout-card";
import { AiPromptCard } from "@/components/features/lms/cards/ai-prompt-card";
import { CompletionCard } from "@/components/features/lms/cards/completion-card";
import { StoryCard } from "@/components/features/lms/cards/story-card";
import { WeeklyTaskCard } from "@/components/features/lms/cards/weekly-task-card";
import { BollplankPromptCard } from "@/components/features/lms/cards/bollplank-prompt-card";

// ── Content block types ────────────────────────────────────────────

type VideoBlock = { type: "video"; title: string; videoId?: string };
type TextBlock = { type: "text"; title?: string; content: string };
type ExerciseTextBlock = { type: "exercise_text"; prompt: string; placeholder?: string; maxLength?: number };
type ExerciseChoiceBlock = { type: "exercise_choice"; question: string; options: { id: string; label: string }[]; allowMultiple?: boolean };
type ExerciseSortingBlock = { type: "exercise_sorting"; instruction: string; items: { id: string; label: string }[] };
type QuizBlock = { type: "quiz"; question: string; options: { id: string; label: string; correct: boolean }[]; explanation: string };
type CalloutBlock = { type: "callout"; variant: "insight" | "warning" | "tip"; content: string };
type AiPromptBlock = { type: "ai_prompt"; prompt: string; lessonId: string };
type CompletionBlock = { type: "completion"; lessonTitle: string; timeSpentMinutes?: number; exercisesCompleted?: number; nextLessonHref?: string; moduleHref: string };
type StoryBlock = { type: "story"; content: string };
type WeeklyTaskBlock = { type: "weekly_task"; tasks: string[]; moduleTitle?: string };
type BollplankPromptBlock = { type: "bollplank_prompt"; prompt: string };

export type ContentBlock =
  | VideoBlock | TextBlock | ExerciseTextBlock | ExerciseChoiceBlock
  | ExerciseSortingBlock | QuizBlock | CalloutBlock | AiPromptBlock
  | CompletionBlock | StoryBlock | WeeklyTaskBlock | BollplankPromptBlock;

// ── Types that require submission before continuing ─────────────────
const EXERCISE_TYPES = new Set(["exercise_text", "exercise_choice", "exercise_sorting", "quiz"]);

// ── Feed component ─────────────────────────────────────────────────

type LessonFeedProps = {
  blocks: ContentBlock[];
  onCardChange?: (index: number) => void;
  onExerciseSubmit?: (blockIndex: number, response: unknown) => void;
};

export function LessonFeed({ blocks, onCardChange, onExerciseSubmit }: LessonFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exerciseDone, setExerciseDone] = useState(false);

  const currentBlock = blocks[currentIndex];
  const isCompletion = currentBlock?.type === "completion";
  const isExercise = EXERCISE_TYPES.has(currentBlock?.type ?? "");
  const showContinue = !isCompletion && (!isExercise || exerciseDone);

  function advance() {
    const next = currentIndex + 1;
    if (next >= blocks.length) return;
    setExerciseDone(false);
    setCurrentIndex(next);
    onCardChange?.(next);
  }

  async function handleExerciseSubmit(blockIndex: number, response: unknown) {
    await onExerciseSubmit?.(blockIndex, response);
    setExerciseDone(true);
  }

  function renderBlock(block: ContentBlock) {
    switch (block.type) {
      case "video":
        return <VideoCard title={block.title} videoId={block.videoId} />;
      case "text":
        return <TextCard title={block.title} content={block.content} />;
      case "story":
        return <StoryCard content={block.content} />;
      case "callout":
        return <CalloutCard variant={block.variant} content={block.content} />;
      case "exercise_text":
        return (
          <ExerciseTextCard
            prompt={block.prompt}
            placeholder={block.placeholder}
            maxLength={block.maxLength}
            onSubmit={(r) => handleExerciseSubmit(currentIndex, r)}
          />
        );
      case "exercise_choice":
        return (
          <ExerciseChoiceCard
            question={block.question}
            options={block.options}
            allowMultiple={block.allowMultiple}
            onSubmit={(r) => handleExerciseSubmit(currentIndex, r)}
          />
        );
      case "exercise_sorting":
        return (
          <ExerciseSortingCard
            instruction={block.instruction}
            items={block.items}
            onSubmit={(r) => handleExerciseSubmit(currentIndex, r)}
          />
        );
      case "quiz":
        return (
          <QuizCard
            question={block.question}
            options={block.options}
            explanation={block.explanation}
            onAnswer={(id, correct) => handleExerciseSubmit(currentIndex, { id, correct })}
          />
        );
      case "ai_prompt":
        return <AiPromptCard prompt={block.prompt} lessonId={block.lessonId} />;
      case "bollplank_prompt":
        return <BollplankPromptCard prompt={block.prompt} onOpen={advance} />;
      case "weekly_task":
        return <WeeklyTaskCard tasks={block.tasks} moduleTitle={block.moduleTitle} />;
      case "completion":
        return (
          <CompletionCard
            lessonTitle={block.lessonTitle}
            timeSpentMinutes={block.timeSpentMinutes}
            exercisesCompleted={block.exercisesCompleted}
            nextLessonHref={block.nextLessonHref}
            moduleHref={block.moduleHref}
          />
        );
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Progress bar */}
      <div className="h-1 w-full bg-navy/8">
        <motion.div
          className="h-full bg-primary"
          animate={{ width: `${((currentIndex + 1) / blocks.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Card */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="w-full"
          >
            {renderBlock(currentBlock)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fortsätt-knapp */}
      {showContinue && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-none border-t border-navy/8 bg-white px-5 py-4 sm:px-8"
        >
          <button
            onClick={advance}
            className="w-full rounded-full bg-primary py-3.5 font-heading text-sm font-semibold text-white transition-all hover:bg-primary-hover sm:w-auto sm:px-10"
          >
            Fortsätt
          </button>
        </motion.div>
      )}
    </div>
  );
}
