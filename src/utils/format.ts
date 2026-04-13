import type { MediaSeason } from '@/types/anime'

export function formatEpisodeProgress(watched: number, total: number | null): string {
  return `${watched} / ${total !== null ? String(total) : '?'}`
}

export function formatScore(score: number | null): string {
  if (score === null) return '—'
  return (score / 10).toFixed(1)
}

export function formatAiringDate(isoDate: string): string {
  const date = new Date(isoDate)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export function formatRelativeDate(isoDate: string): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const diffMs = new Date(isoDate).getTime() - Date.now()
  const diffSecs = Math.round(diffMs / 1000)
  const diffMins = Math.round(diffSecs / 60)
  const diffHours = Math.round(diffMins / 60)
  const diffDays = Math.round(diffHours / 24)
  const diffWeeks = Math.round(diffDays / 7)
  const diffMonths = Math.round(diffDays / 30)
  const diffYears = Math.round(diffDays / 365)

  if (Math.abs(diffSecs) < 60) return rtf.format(diffSecs, 'second')
  if (Math.abs(diffMins) < 60) return rtf.format(diffMins, 'minute')
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour')
  if (Math.abs(diffDays) < 7) return rtf.format(diffDays, 'day')
  if (Math.abs(diffWeeks) < 5) return rtf.format(diffWeeks, 'week')
  // Month/year approximations are intentional — native Intl.RelativeTimeFormat only
  // accepts a numeric unit, so we use 30d/365d estimates for display purposes.
  if (Math.abs(diffMonths) < 12) return rtf.format(diffMonths, 'month')
  return rtf.format(diffYears, 'year')
}

export function formatSeason(season: MediaSeason, year: number): string {
  const label = season.charAt(0) + season.slice(1).toLowerCase()
  return `${label} ${year}`
}
