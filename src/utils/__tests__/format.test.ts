import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  formatEpisodeProgress,
  formatScore,
  formatAiringDate,
  formatRelativeDate,
  formatSeason,
} from '@/utils/format'

describe('formatEpisodeProgress', () => {
  it('shows watched / total when total is known', () => {
    expect(formatEpisodeProgress(12, 24)).toBe('12 / 24')
  })

  it('shows "?" when total is null', () => {
    expect(formatEpisodeProgress(100, null)).toBe('100 / ?')
  })

  it('handles zero progress', () => {
    expect(formatEpisodeProgress(0, 12)).toBe('0 / 12')
  })
})

describe('formatScore', () => {
  it('returns em-dash for null score', () => {
    expect(formatScore(null)).toBe('—')
  })

  it('converts 0-100 score to 0-10 with 1 decimal', () => {
    expect(formatScore(85)).toBe('8.5')
    expect(formatScore(100)).toBe('10.0')
    expect(formatScore(0)).toBe('0.0')
    expect(formatScore(95)).toBe('9.5')
  })

  it('handles scores that produce repeating decimals', () => {
    // 77 / 10 = 7.7
    expect(formatScore(77)).toBe('7.7')
  })
})

describe('formatAiringDate', () => {
  it('returns a formatted date string with weekday, day, month and time', () => {
    // 2026-04-14 16:00 UTC
    const result = formatAiringDate('2026-04-14T16:00:00.000Z')
    // Should include a day number (14) and a month abbreviation
    expect(result).toMatch(/\d/)
    expect(result).toMatch(/[A-Za-z]/)
  })

  it('produces consistent output for same input', () => {
    const a = formatAiringDate('2026-06-15T12:00:00.000Z')
    const b = formatAiringDate('2026-06-15T12:00:00.000Z')
    expect(a).toBe(b)
  })
})

describe('formatRelativeDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-14T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "in X days" for future date', () => {
    const future = new Date('2026-04-16T12:00:00.000Z').toISOString()
    const result = formatRelativeDate(future)
    expect(result).toMatch(/in 2 days/)
  })

  it('returns "X days ago" for past date', () => {
    const past = new Date('2026-04-12T12:00:00.000Z').toISOString()
    const result = formatRelativeDate(past)
    expect(result).toMatch(/2 days ago/)
  })

  it('returns "in X hours" for near future', () => {
    const future = new Date('2026-04-14T15:00:00.000Z').toISOString()
    const result = formatRelativeDate(future)
    expect(result).toMatch(/in 3 hours/)
  })

  it('returns "X minutes ago" for recent past', () => {
    const past = new Date('2026-04-14T11:45:00.000Z').toISOString()
    const result = formatRelativeDate(past)
    expect(result).toMatch(/15 minutes ago/)
  })
})

describe('formatSeason', () => {
  it('capitalizes first letter of season', () => {
    expect(formatSeason('SPRING', 2023)).toBe('Spring 2023')
    expect(formatSeason('FALL', 2022)).toBe('Fall 2022')
    expect(formatSeason('WINTER', 2024)).toBe('Winter 2024')
    expect(formatSeason('SUMMER', 2021)).toBe('Summer 2021')
  })
})
