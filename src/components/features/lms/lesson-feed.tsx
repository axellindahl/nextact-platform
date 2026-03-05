"use client";

import { useEffect, useRef, useCallback } from "react";
import { VideoCard } from "@/components/features/lms/cards/video-card";
import { TextCard } from "@/components/features/lms/cards/text-card";
import { ExerciseTextCard } from "@/components/features/lms/cards/exercise-text-card";
import { ExerciseChoiceCard } from "@/components/features/lms/cards/exercise-choice-card";
import { ExerciseSortingCard } from "@/components/features/lms/cards/exercise-sorting-card";
import { QuizCard } from "@/components/features/lms/cards/quiz-card";
import { CalloutCard } from "@/components/features/lms/cards/callout-card";
import { AiPromptCard } from "@/components/features/lms/cards/ai-prompt-card";
import { CompletionCard } from "@/components/features/lms/cards/completion-card";

// ── Content block types ────────────────────────────────────────────

type VideoBlock = {
  type: "video";
  title: string;
  videoId?: string;
};

type TextBlock = {
  type: "text";
  title?: string;
  content: string;
};

type ExerciseTextBlock = {
  type: "exercise_text";
  prompt: string;
  placeholder?: string;
  maxLength?: number;
};

type ExerciseChoiceBlock = {
  type: "exercise_choice";
  question: string;
  options: { id: string; label: string }[];
  allowMultiple?: boolean;
};

type ExerciseSortingBlock = {
  type: "exercise_sorting";
  instruction: string;
  items: { id: string; label: string }[];
};

type QuizBlock = {
  type: "quiz";
  question: string;
  options: { id: string; label: string; correct: boolean }[];
  explanation: string;
};

type CalloutBlock = {
  type: "callout";
  variant: "insight" | "warning" | "tip";
  content: string;
};

type AiPromptBlock = {
  type: "ai_prompt";
  prompt: string;
  lessonId: string;
};

type CompletionBlock = {
  type: "completion";
  lessonTitle: string;
  timeSpentMinutes?: number;
  exercisesCompleted?: number;
  nextLessonHref?: string;
  moduleHref: string;
};

export type ContentBlock =
  | VideoBlock
  | TextBlock
  | ExerciseTextBlock
  | ExerciseChoiceBlock
  | ExerciseSortingBlock
  | QuizBlock
  | CalloutBlock
  | AiPromptBlock
  | CompletionBlock;

// ── Feed component ─────────────────────────────────────────────────

type LessonFeedProps = {
  blocks: ContentBlock[];
  onCardChange?: (index: number) => void;
  onExerciseSubmit?: (blockIndex: number, response: unknown) => void;
};

export function LessonFeed({
  blocks,
  onCardChange,
  onExerciseSubmit,
}: LessonFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setCardRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      cardRefs.current[index] = el;
    },
    []
  );

  // IntersectionObserver for active card detection
  useEffect(() => {
    if (!onCardChange) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = cardRefs.current.indexOf(
              entry.target as HTMLDivElement
            );
            if (index !== -1) {
              onCardChange(index);
            }
          }
        }
      },
      { threshold: 0.5 }
    );

    const currentRefs = cardRefs.current;
    for (const ref of currentRefs) {
      if (ref) observer.observe(ref);
    }

    return () => {
      for (const ref of currentRefs) {
        if (ref) observer.unobserve(ref);
      }
    };
  }, [blocks.length, onCardChange]);

  function renderBlock(block: ContentBlock, index: number) {
    switch (block.type) {
      case "video":
        return (
          <VideoCard
            title={block.title}
            videoId={block.videoId}
            onContinue={() => scrollToCard(index + 1)}
          />
        );
      case "text":
        return <TextCard title={block.title} content={block.content} />;
      case "exercise_text":
        return (
          <ExerciseTextCard
            prompt={block.prompt}
            placeholder={block.placeholder}
            maxLength={block.maxLength}
            onSubmit={(response) => onExerciseSubmit?.(index, response)}
          />
        );
      case "exercise_choice":
        return (
          <ExerciseChoiceCard
            question={block.question}
            options={block.options}
            allowMultiple={block.allowMultiple}
            onSubmit={(selected) => onExerciseSubmit?.(index, selected)}
          />
        );
      case "exercise_sorting":
        return (
          <ExerciseSortingCard
            instruction={block.instruction}
            items={block.items}
            onSubmit={(ordered) => onExerciseSubmit?.(index, ordered)}
          />
        );
      case "quiz":
        return (
          <QuizCard
            question={block.question}
            options={block.options}
            explanation={block.explanation}
            onAnswer={(selectedId, isCorrect) =>
              onExerciseSubmit?.(index, { selectedId, isCorrect })
            }
          />
        );
      case "callout":
        return <CalloutCard variant={block.variant} content={block.content} />;
      case "ai_prompt":
        return <AiPromptCard prompt={block.prompt} lessonId={block.lessonId} />;
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

  function scrollToCard(index: number) {
    const card = cardRefs.current[index];
    if (card) {
      card.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div
      ref={containerRef}
      className="mx-auto h-dvh max-w-3xl overflow-y-auto scroll-smooth snap-y snap-mandatory"
    >
      {blocks.map((block, index) => (
        <div
          key={index}
          ref={setCardRef(index)}
          className="h-dvh snap-start snap-always"
        >
          {renderBlock(block, index)}
        </div>
      ))}
    </div>
  );
}
