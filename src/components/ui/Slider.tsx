import { type InputHTMLAttributes } from 'react'

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  showValue?: boolean
  valueLabel?: string
}

export function Slider({ label, showValue = true, valueLabel, className = '', id, value, ...props }: SliderProps) {
  const sliderId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && <label htmlFor={sliderId} className="text-sm font-medium text-kakera-primary-300">{label}</label>}
          {showValue && <span className="text-xs text-kakera-muted tabular-nums">{valueLabel ?? value}</span>}
        </div>
      )}
      <input
        id={sliderId}
        type="range"
        value={value}
        className="w-full accent-kakera-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent rounded"
        {...props}
      />
    </div>
  )
}
