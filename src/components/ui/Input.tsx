import { type InputHTMLAttributes, type ReactNode } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

export function Input({ label, error, icon, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-kakera-primary-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-kakera-muted pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full rounded-lg border bg-kakera-primary-800 text-white placeholder:text-kakera-muted
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent
            ${icon ? 'pl-9' : 'pl-3'} pr-3 py-2 text-sm
            ${error ? 'border-red-500' : 'border-kakera-primary-600'}
            ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
    </div>
  )
}
