"use client";

import { useState, useTransition } from "react";
import { saveTrainingSchedule, savePhoneNumber } from "@/lib/actions/profile";

const DAYS = [
  { id: "monday", label: "Måndag" },
  { id: "tuesday", label: "Tisdag" },
  { id: "wednesday", label: "Onsdag" },
  { id: "thursday", label: "Torsdag" },
  { id: "friday", label: "Fredag" },
  { id: "saturday", label: "Lördag" },
  { id: "sunday", label: "Söndag" },
] as const;

type TrainingDay = { day: string; time: string };

type Props = {
  initialSchedule: TrainingDay[];
  initialPhoneNumber: string;
};

export function TrainingScheduleForm({ initialSchedule, initialPhoneNumber }: Props) {
  const [schedule, setSchedule] = useState<TrainingDay[]>(initialSchedule);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleDay(dayId: string) {
    setSchedule((prev) => {
      const exists = prev.find((d) => d.day === dayId);
      if (exists) return prev.filter((d) => d.day !== dayId);
      return [...prev, { day: dayId, time: "17:00" }];
    });
  }

  function setTime(dayId: string, time: string) {
    setSchedule((prev) =>
      prev.map((d) => (d.day === dayId ? { ...d, time } : d))
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await savePhoneNumber(phoneNumber);
      await saveTrainingSchedule(schedule);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Ditt mobilnummer (för SMS-påminnelser)
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+46701234567"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-gray-700">
          Dina träningstider (SMS skickas 1 timme innan)
        </p>
        <div className="space-y-2">
          {DAYS.map(({ id, label }) => {
            const entry = schedule.find((d) => d.day === id);
            const isChecked = !!entry;
            return (
              <div key={id} className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => toggleDay(id)}
                  className={`h-5 w-5 shrink-0 rounded border-2 transition-colors ${
                    isChecked
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300 bg-white"
                  }`}
                  aria-label={`${isChecked ? "Avmarkera" : "Markera"} ${label}`}
                />
                <span className="w-24 text-sm text-gray-700">{label}</span>
                {isChecked && (
                  <input
                    type="time"
                    value={entry.time}
                    onChange={(e) => setTime(id, e.target.value)}
                    className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Sparar..." : saved ? "Sparat! ✓" : "Spara träningstider"}
      </button>
    </form>
  );
}
