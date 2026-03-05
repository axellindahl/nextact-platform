"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-heading text-4xl font-bold">N\u00e5got gick fel</h1>
      <p className="mt-4 text-lg text-charcoal">
        Ett ov\u00e4ntat fel uppstod. F\u00f6rs\u00f6k igen.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary-hover"
      >
        F\u00f6rs\u00f6k igen
      </button>
    </div>
  );
}
