"use client"

import ErrorComponent from "@/components/Error";

export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorComponent error={error} onRetry={reset} />
  );
}
