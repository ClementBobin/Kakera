import { describe, it, expect } from 'vitest'
import { sortAnime } from '@/features/library/utils/sort'
import { MOCK_ANIME } from '@/mocks/anime'

describe('sortAnime (legacy re-export)', () => {
  it('sorts alphabetically by romaji title', () => {
    const result = sortAnime(MOCK_ANIME, 'alphabetical')
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].title.romaji.localeCompare(result[i + 1].title.romaji)).toBeLessThanOrEqual(0)
    }
  })

  it('sorts by score descending, null last', () => {
    const result = sortAnime(MOCK_ANIME, 'score')
    const scored = result.filter((e) => e.score !== null)
    for (let i = 0; i < scored.length - 1; i++) {
      expect(scored[i].score!).toBeGreaterThanOrEqual(scored[i + 1].score!)
    }
  })

  it('sorts randomly but returns same length', () => {
    const result = sortAnime(MOCK_ANIME, 'random')
    expect(result).toHaveLength(MOCK_ANIME.length)
  })
})
