import { type InputHTMLAttributes } from 'react'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

export function Checkbox({ label, className = '', id, ...props }: CheckboxProps) {
  const checkId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <label htmlFor={checkId} className={`flex items-center gap-2 cursor-pointer select-none ${className}`}>
      <input
        id={checkId}
        type="checkbox"
        className="w-4 h-4 rounded border border-kakera-primary-500 bg-kakera-primary-800
          accent-kakera-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
        {...props}
      />
      <span className="text-sm text-kakera-primary-200">{label}</span>
    </label>
  )
}
