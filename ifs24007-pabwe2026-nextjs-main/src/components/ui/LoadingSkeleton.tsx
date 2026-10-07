export default function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div role="status" aria-live="polite" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <span className="sr-only">Memuat konten...</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} aria-hidden="true" className="h-64 animate-pulse rounded-2xl bg-slate-800/60" />
      ))}
    </div>
  );
}
