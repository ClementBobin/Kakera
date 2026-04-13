export interface SkeletonProps {
  className?: string
  rounded?: boolean
}

export function Skeleton({ className = '', rounded = false }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-kakera-primary-700 ${rounded ? 'rounded-full' : 'rounded-md'} ${className}`}
      aria-hidden="true"
    />
  )
}
