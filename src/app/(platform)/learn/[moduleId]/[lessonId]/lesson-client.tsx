"use client";

import { useCallback, useRef } from "react";
import {
  LessonFeed,
  type ContentBlock,
} from "@/components/features/lms/lesson-feed";
import {
  markLessonCompleted,
  submitExerciseResponse,
} from "@/lib/actions/lessons";

type LessonClientProps = {
  blocks: ContentBlock[];
  lessonId: string;
};

export function LessonClient({ blocks, lessonId }: LessonClientProps) {
  const responsesRef = useRef<Record<string, unknown>>({});
  const completedRef = useRef(false);

  const handleExerciseSubmit = useCallback(
    async (blockIndex: number, response: unknown) => {
      responsesRef.current[String(blockIndex)] = response;
      await submitExerciseResponse(lessonId, responsesRef.current);
    },
    [lessonId]
  );

  const handleCardChange = useCallback(
    async (index: number) => {
      // When the user reaches the completion card, mark the lesson as completed
      const block = blocks[index];
      if (block?.type === "completion" && !completedRef.current) {
        completedRef.current = true;
        await markLessonCompleted(lessonId);
      }
    },
    [blocks, lessonId]
  );

  return (
    <div className="-mx-4 -my-6 sm:-mx-6 lg:-mx-8 lg:-my-8">
      <LessonFeed
        blocks={blocks}
        onCardChange={handleCardChange}
        onExerciseSubmit={handleExerciseSubmit}
      />
    </div>
  );
}
