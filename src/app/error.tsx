"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="m-0 text-2xl font-semibold">Something went wrong</h1>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
