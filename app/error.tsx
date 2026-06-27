"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-[#003893] mb-3">
          Something went wrong
        </h2>
        <p className="text-muted-foreground mb-6">
          We hit an unexpected error while loading this section. You can try
          again — the rest of the site is still available.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#DC143C] to-[#003893] hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full px-6 py-2.5 text-sm font-semibold text-[#003893] border border-[#003893]/30 hover:border-[#003893] transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}