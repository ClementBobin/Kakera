import { type ButtonHTMLAttributes } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export function Button({ variant = 'primary', size = 'md', loading = false, children, className = '', disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-kakera-accent text-white hover:bg-kakera-accent-dark focus-visible:ring-kakera-accent',
    ghost: 'bg-transparent text-kakera-primary-300 hover:bg-kakera-primary-700 focus-visible:ring-kakera-primary-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  }
  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading && <ButtonSpinner />}
      {children}
    </button>
  )
}

function ButtonSpinner() {
  return <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
}
