"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard route failed", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
      <div className="max-w-sm space-y-5 text-center">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">
            PHOTOGRAPHY STUDIO
          </p>
          <h1 className="text-2xl font-medium tracking-tight">
            This view could not be loaded
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            The archive is still intact. Retry the request or return to the
            public site.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm text-background"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full border border-border px-5 py-2.5 text-sm"
          >
            Back to site
          </a>
        </div>
      </div>
    </div>
  );
}
