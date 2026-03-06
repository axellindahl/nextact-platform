"use client";
import { useState } from "react";

type WeeklyTaskCardProps = {
  tasks: string[];
  moduleTitle?: string;
};

export function WeeklyTaskCard({ tasks, moduleTitle }: WeeklyTaskCardProps) {
  const [checked, setChecked] = useState<boolean[]>(tasks.map(() => false));

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="w-full max-w-md rounded-2xl bg-blue-50 p-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
          Veckans uppgifter
        </p>
        {moduleTitle && (
          <h2 className="mb-6 font-montserrat text-2xl font-bold text-gray-900">
            {moduleTitle}
          </h2>
        )}
        <ul className="space-y-4">
          {tasks.map((task, i) => (
            <li key={i} className="flex items-start gap-3">
              <button
                onClick={() =>
                  setChecked((c) => c.map((v, j) => (j === i ? !v : v)))
                }
                className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 transition-colors ${
                  checked[i]
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-400 bg-white"
                }`}
                aria-label={checked[i] ? "Avmarkera" : "Markera"}
              />
              <span
                className={`font-source-sans text-gray-700 transition-opacity ${
                  checked[i] ? "line-through opacity-50" : ""
                }`}
              >
                {task}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-gray-500">
          Du får dessa uppgifter via SMS inför din nästa träning.
        </p>
      </div>
    </div>
  );
}
