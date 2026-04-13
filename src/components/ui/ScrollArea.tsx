import { type ReactNode } from 'react'

export interface ScrollAreaProps {
  children: ReactNode
  className?: string
  orientation?: 'vertical' | 'horizontal' | 'both'
}

export function ScrollArea({ children, className = '', orientation = 'vertical' }: ScrollAreaProps) {
  const overflowClass = {
    vertical: 'overflow-y-auto overflow-x-hidden',
    horizontal: 'overflow-x-auto overflow-y-hidden',
    both: 'overflow-auto',
  }
  return (
    <div
      className={`${overflowClass[orientation]} scrollbar-thin scrollbar-thumb-kakera-primary-600 scrollbar-track-transparent ${className}`}
    >
      {children}
    </div>
  )
}
