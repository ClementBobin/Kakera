export function TitleBar() {
  return (
    <div
      data-tauri-drag-region
      className="h-8 flex items-center justify-between px-3 bg-kakera-primary-950 select-none shrink-0"
    >
      <span className="text-xs font-bold text-kakera-accent tracking-widest">KAKERA</span>
      <div className="flex gap-1.5">
        <button
          className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-200"
          aria-label="Minimize window"
        />
        <button
          className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-200"
          aria-label="Maximize window"
        />
        <button
          className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-200"
          aria-label="Close window"
        />
      </div>
    </div>
  )
}
