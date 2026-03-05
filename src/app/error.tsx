"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-heading text-4xl font-bold">Något gick fel</h1>
      <p className="mt-4 text-lg text-charcoal">
        Ett oväntat fel uppstod. Försök igen.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary-hover"
      >
        Försök igen
      </button>
    </div>
  );
}
