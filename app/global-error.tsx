"use client";

import { useEffect } from "react";

// Catches failures in the root layout itself (e.g. if a Header data fetch
// rejects outright rather than just being slow) — the one place app/error.tsx
// can't reach, since it doesn't wrap its own segment's layout.tsx. Renders
// its own <html>/<body> because it replaces the root layout entirely.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <h1 className="text-lg font-semibold text-zinc-900">Something went wrong</h1>
        <p className="mt-1.5 max-w-md text-sm text-zinc-500">
          That&apos;s likely a temporary connection hiccup. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
