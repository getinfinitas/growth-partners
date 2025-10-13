import { CardSkeleton } from '@/components/LoadingUI';

export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-10 bg-muted animate-pulse rounded mb-2"></div>
        <div className="h-6 bg-muted animate-pulse rounded w-96"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
