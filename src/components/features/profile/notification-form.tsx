"use client";

import { useTransition, useState } from "react";
import { updateNotificationPreferences } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";

type NotificationFormProps = {
  initialChannels: string[];
  initialQuietStart: string | null;
  initialQuietEnd: string | null;
};

export function NotificationForm({
  initialChannels,
  initialQuietStart,
  initialQuietEnd,
}: NotificationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [channels, setChannels] = useState(initialChannels);
  const [quietStart, setQuietStart] = useState(initialQuietStart ?? "");
  const [quietEnd, setQuietEnd] = useState(initialQuietEnd ?? "");

  function toggleChannel(channel: string) {
    setChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await updateNotificationPreferences({
        preferredChannels: channels,
        quietHoursStart: quietStart || null,
        quietHoursEnd: quietEnd || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-charcoal">
          Kanaler
        </legend>
        <div className="flex gap-4">
          {[
            { id: "email", label: "E-post" },
            { id: "in_app", label: "I appen" },
          ].map((ch) => (
            <label key={ch.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={channels.includes(ch.id)}
                onChange={() => toggleChannel(ch.id)}
                className="h-4 w-4 rounded border-light-gray accent-primary"
              />
              {ch.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-charcoal">
          Tysta timmar
        </legend>
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={quietStart}
            onChange={(e) => setQuietStart(e.target.value)}
            className="rounded-lg border border-light-gray/50 px-3 py-2 text-sm text-charcoal focus:border-primary focus:outline-none"
            aria-label="Tysta timmar starttid"
          />
          <span className="text-sm text-charcoal/50">till</span>
          <input
            type="time"
            value={quietEnd}
            onChange={(e) => setQuietEnd(e.target.value)}
            className="rounded-lg border border-light-gray/50 px-3 py-2 text-sm text-charcoal focus:border-primary focus:outline-none"
            aria-label="Tysta timmar sluttid"
          />
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sparar..." : "Spara"}
        </Button>
        {saved && <span className="text-sm text-success">Sparat!</span>}
      </div>
    </form>
  );
}
