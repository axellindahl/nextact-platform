"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Player from "@vimeo/player";

type VimeoPlayerProps = {
  videoId: string;
  onProgress?: (percent: number) => void;
  onComplete?: () => void;
  onReady?: () => void;
  autoplay?: boolean;
  className?: string;
};

export function VimeoPlayer({
  videoId,
  onProgress,
  onComplete,
  onReady,
  autoplay = false,
  className = "",
}: VimeoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const completedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const handleComplete = useCallback(() => {
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  }, [onComplete]);

  useEffect(() => {
    if (!containerRef.current) return;

    completedRef.current = false;
    setProgress(0);
    setIsPlaying(false);

    const player = new Player(containerRef.current, {
      id: Number(videoId),
      controls: false,
      dnt: true,
      title: false,
      byline: false,
      portrait: false,
      muted: true,
      responsive: true,
      autoplay,
    });

    playerRef.current = player;

    player.ready().then(() => {
      player.enableTextTrack("sv").catch(() => {
        // Swedish text track may not be available
      });
      onReady?.();
    });

    player.on("timeupdate", (data: { percent: number }) => {
      setProgress(data.percent);
      onProgress?.(data.percent);
      if (data.percent > 0.9) {
        handleComplete();
      }
    });

    player.on("play", () => setIsPlaying(true));
    player.on("pause", () => setIsPlaying(false));
    player.on("ended", () => {
      setIsPlaying(false);
      handleComplete();
    });

    return () => {
      player.destroy();
      playerRef.current = null;
    };
  }, [videoId, autoplay, onReady, onProgress, handleComplete]);

  const togglePlay = useCallback(async () => {
    const player = playerRef.current;
    if (!player) return;

    const paused = await player.getPaused();
    if (paused) {
      await player.play();
    } else {
      await player.pause();
    }
  }, []);

  const toggleMute = useCallback(async () => {
    const player = playerRef.current;
    if (!player) return;

    const volume = await player.getVolume();
    if (volume === 0) {
      await player.setVolume(1);
      setIsMuted(false);
    } else {
      await player.setVolume(0);
      setIsMuted(true);
    }
  }, []);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-black ${className}`}
    >
      <div ref={containerRef} className="aspect-video w-full" />

      {/* Play/Pause overlay */}
      <button
        type="button"
        onClick={togglePlay}
        className={`
          absolute inset-0 flex items-center justify-center
          transition-opacity duration-300
          ${isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"}
        `}
        aria-label={isPlaying ? "Pausa video" : "Spela video"}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform hover:scale-110">
          {isPlaying ? (
            <svg
              className="h-6 w-6 text-[#2670E6]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg
              className="ml-1 h-7 w-7 text-[#2670E6]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36A1 1 0 008 5.14z" />
            </svg>
          )}
        </div>
      </button>

      {/* Mute/Unmute toggle */}
      <button
        type="button"
        onClick={toggleMute}
        className="absolute right-3 bottom-10 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
        aria-label={isMuted ? "Slå på ljud" : "Stäng av ljud"}
      >
        {isMuted ? (
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
          </svg>
        )}
      </button>

      {/* Progress bar */}
      <div className="absolute right-0 bottom-0 left-0 h-1 bg-white/20">
        <div
          className="h-full bg-[#2670E6] transition-[width] duration-300 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
