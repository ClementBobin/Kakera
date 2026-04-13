import { type ReactNode } from 'react'

export interface BadgeProps {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'danger'
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-kakera-primary-700 text-kakera-primary-200',
    info: 'bg-blue-500/20 text-blue-300',
    success: 'bg-green-500/20 text-green-300',
    warning: 'bg-yellow-500/20 text-yellow-300',
    danger: 'bg-red-500/20 text-red-300',
  }
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
