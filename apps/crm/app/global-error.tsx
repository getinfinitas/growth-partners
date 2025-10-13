"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h2 className="text-2xl font-bold">Something went wrong!</h2>
          <p className="mt-4 text-muted-foreground">
            {error.message || "An unexpected error occurred"}
          </p>
          <button onClick={() => reset()} className="mt-6">
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
