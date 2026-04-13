import { type ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

export function Dialog({ open, onClose, title, children, className = '' }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) dialogRef.current?.focus()
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        tabIndex={-1}
        className={`relative z-10 w-full max-w-lg rounded-xl bg-kakera-primary-900 border border-kakera-primary-700 shadow-2xl p-6 focus-visible:outline-none ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="dialog-title" className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded text-kakera-muted hover:text-white hover:bg-kakera-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}
