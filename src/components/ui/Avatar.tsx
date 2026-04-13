export interface AvatarProps {
  src?: string | null
  alt: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ src, alt, size = 'md', className = '' }: AvatarProps) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' }
  const initials = alt.slice(0, 2).toUpperCase()

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={(e) => {
          const target = e.currentTarget
          target.style.display = 'none'
        }}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
      />
    )
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-kakera-accent flex items-center justify-center font-medium text-white ${className}`}>
      {initials}
    </div>
  )
}
