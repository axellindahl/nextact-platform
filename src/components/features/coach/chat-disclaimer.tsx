"use client";

import { useState } from "react";

export function ChatDisclaimer() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative border-b border-amber-200 bg-amber-50/80 px-4 py-2.5 pr-10">
      <p className="text-xs leading-relaxed text-amber-900/70">
        Next Act AI-coachen {"ä"}r ett verktyg f{"ö"}r mental tr
        {"ä"}ning {"–"} inte terapi eller behandling. Vid akut psykisk
        oh{"ä"}lsa, kontakta Sj{"ä"}lvmordslinjen 90101 eller 1177.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-amber-600/60 hover:text-amber-800 transition-colors"
        aria-label="Stäng"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
