"use client";

type BollplankPromptCardProps = {
  prompt: string;
  onOpen?: () => void;
};

export function BollplankPromptCard({ prompt, onOpen }: BollplankPromptCardProps) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="w-full max-w-md rounded-2xl border border-blue-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 text-4xl">🧠</div>
        <p className="mb-6 font-source-sans text-lg text-gray-700">{prompt}</p>
        <button
          onClick={onOpen}
          className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Prata med ditt mentala bollplank
        </button>
      </div>
    </div>
  );
}
