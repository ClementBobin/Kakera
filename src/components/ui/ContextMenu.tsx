import { type ReactNode, useState, useRef, useEffect } from 'react'

export interface ContextMenuItem {
  label: string
  icon?: ReactNode
  onClick: () => void
  danger?: boolean
  dividerAfter?: boolean
}

export interface ContextMenuProps {
  items: ContextMenuItem[]
  children: ReactNode
}

export function ContextMenu({ items, children }: ContextMenuProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setPos({ x: e.clientX, y: e.clientY })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('click', close)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('click', close)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <>
      <div onContextMenu={handleContextMenu}>{children}</div>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="fixed z-50 min-w-[160px] rounded-lg bg-kakera-primary-900 border border-kakera-primary-700 shadow-xl py-1"
          style={{ left: pos.x, top: pos.y }}
        >
          {items.map((item, i) => (
            <div key={i}>
              <button
                role="menuitem"
                onClick={() => { item.onClick(); setOpen(false) }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-kakera-accent
                  ${item.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-kakera-primary-200 hover:bg-kakera-primary-700'}`}
              >
                {item.icon && <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>}
                {item.label}
              </button>
              {item.dividerAfter && <div className="my-1 border-t border-kakera-primary-700" />}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
