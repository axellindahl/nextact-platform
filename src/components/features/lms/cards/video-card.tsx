"use client";

import { VimeoPlayer } from "@/components/features/lms/vimeo-player";

type VideoCardProps = {
  title: string;
  videoId?: string;
  onComplete?: () => void;
  onContinue?: () => void;
};

export function VideoCard({
  title,
  videoId,
  onComplete,
  onContinue,
}: VideoCardProps) {
  return (
    <div className="flex h-dvh flex-col bg-navy">
      {/* Title overlay */}
      <div className="shrink-0 px-6 pt-8 pb-4">
        <h2 className="font-heading text-lg font-semibold text-white">
          {title}
        </h2>
      </div>

      {/* Video area */}
      <div className="flex flex-1 items-center justify-center px-6">
        {videoId ? (
          <VimeoPlayer
            videoId={videoId}
            onComplete={onComplete}
            className="w-full max-w-3xl"
          />
        ) : (
          <div className="aspect-video w-full max-w-3xl rounded-2xl bg-white/10" />
        )}
      </div>

      {/* Bottom action */}
      <div className="shrink-0 px-6 pt-4 pb-8 text-center">
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-[3rem] bg-primary px-8 py-3 font-heading text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover"
        >
          Fortsätt
          <svg
            className="h-4 w-4"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M8 3v10M3 8l5 5 5-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
