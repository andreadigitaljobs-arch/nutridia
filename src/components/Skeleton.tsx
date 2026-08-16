interface SkeletonProps {
  className?: string
  count?: number
}

export default function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`rounded-xl bg-mint/40 ${className}`}
        />
      ))}
    </div>
  )
}
