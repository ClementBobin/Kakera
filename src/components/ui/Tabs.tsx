export interface TabItem {
  value: string
  label: string
  count?: number
}

export interface TabsProps {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function Tabs({ items, value, onChange, className = '' }: TabsProps) {
  return (
    <div role="tablist" className={`flex gap-1 ${className}`}>
      {items.map((item) => (
        <button
          key={item.value}
          role="tab"
          aria-selected={value === item.value}
          onClick={() => onChange(item.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent
            ${value === item.value
              ? 'bg-kakera-accent text-white'
              : 'text-kakera-primary-300 hover:bg-kakera-primary-700 hover:text-white'
            }`}
        >
          {item.label}
          {item.count !== undefined && (
            <span className={`text-xs px-1 rounded ${value === item.value ? 'bg-white/20' : 'bg-kakera-primary-700'}`}>
              {item.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
