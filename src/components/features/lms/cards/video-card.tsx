"use client";

import { VimeoPlayer } from "@/components/features/lms/vimeo-player";

type VideoCardProps = {
  title: string;
  videoId?: string;
  onComplete?: () => void;
};

export function VideoCard({ title, videoId, onComplete }: VideoCardProps) {
  return (
    <div className="w-full bg-[#0f1f3d]">
      {videoId ? (
        <VimeoPlayer
          videoId={videoId}
          onComplete={onComplete}
          className="w-full rounded-none"
        />
      ) : (
        <div className="aspect-video w-full flex items-center justify-center bg-white/5">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <svg className="h-7 w-7 text-white/60" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="mt-3 text-sm text-white/40">Video kommer snart</p>
          </div>
        </div>
      )}

      {title && (
        <div className="px-6 py-6 sm:px-10">
          <h2 className="font-heading text-xl font-bold text-white">{title}</h2>
        </div>
      )}
    </div>
  );
}
