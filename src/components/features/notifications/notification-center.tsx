"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import {
  getNotifications,
  markNotificationRead,
  markAllRead,
} from "@/lib/actions/notifications";
import type { Json } from "@/lib/supabase/types";

type NotificationType =
  | "module_unlocked"
  | "streak_reminder"
  | "exercise_feedback"
  | "announcement";

interface Notification {
  id: string;
  type: string;
  channel: string;
  status: string;
  content: Json;
  created_at: string;
}

const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  module_unlocked: "\ud83d\udd13",
  streak_reminder: "\ud83d\udd25",
  exercise_feedback: "\ud83d\udcac",
  announcement: "\ud83d\udce2",
};

const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  module_unlocked: "Ny modul upplåst",
  streak_reminder: "Streak-påminnelse",
  exercise_feedback: "Återkoppling",
  announcement: "Nyhet",
};

function getNotificationContent(notification: Notification): {
  title: string;
  body: string;
} {
  const type = notification.type as NotificationType;
  const content = notification.content as Record<string, unknown> | null;

  return {
    title: (content?.title as string) ?? NOTIFICATION_LABELS[type] ?? "Notis",
    body: (content?.body as string) ?? "",
  };
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.status !== "read").length;

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await getNotifications(20);
        setNotifications(data);
      } catch {
        // Notifications unavailable -- silent fail
      }
    });
  }, []);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  async function handleMarkRead(id: string) {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: "read" } : n))
      );
    } catch {
      // Silent fail
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
    } catch {
      // Silent fail
    }
  }

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-charcoal transition-colors hover:bg-off-white-alt hover:text-navy"
        aria-label={`Notifikationer${unreadCount > 0 ? ` (${unreadCount} olästa)` : ""}`}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-off-white-alt bg-white shadow-lg shadow-navy/10">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-off-white-alt px-4 py-3">
            <h3 className="font-heading text-sm font-semibold text-navy">
              Notifikationer
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:text-primary-hover"
              >
                Markera alla som lästa
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {isPending && notifications.length === 0 && (
              <div className="p-6 text-center text-sm text-charcoal">
                Laddar...
              </div>
            )}

            {!isPending && notifications.length === 0 && (
              <div className="p-6 text-center text-sm text-charcoal">
                Inga notifikationer ännu.
              </div>
            )}

            {notifications.map((notification) => {
              const { title, body } = getNotificationContent(notification);
              const type = notification.type as NotificationType;
              const isUnread = notification.status !== "read";

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    if (isUnread) handleMarkRead(notification.id);
                  }}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-off-white ${
                    isUnread ? "bg-primary/5" : ""
                  }`}
                >
                  <span className="mt-0.5 text-base">
                    {NOTIFICATION_ICONS[type] ?? "\ud83d\udce8"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm ${isUnread ? "font-semibold text-navy" : "text-charcoal"}`}
                    >
                      {title}
                    </p>
                    {body && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-charcoal">
                        {body}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-light-gray">
                      {formatRelativeTime(notification.created_at)}
                    </p>
                  </div>
                  {isUnread && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just nu";
  if (diffMin < 60) return `${diffMin} min sedan`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} tim sedan`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} dag${diffDays > 1 ? "ar" : ""} sedan`;

  return new Date(dateStr).toLocaleDateString("sv-SE");
}
