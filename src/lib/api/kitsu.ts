const KITSU_API_URL = 'https://kitsu.io/api/edge'

export interface KitsuAnime {
  id: string
  type: 'anime'
  attributes: {
    canonicalTitle: string
    titles: Record<string, string>
    episodeCount?: number
    averageRating?: string
    posterImage?: {
      small?: string
      medium?: string
      large?: string
    }
    status?: string
    subtype?: string
  }
}

export interface KitsuLibraryEntry {
  id: string
  type: 'libraryEntries'
  attributes: {
    status: string
    ratingTwenty?: number
    progress: number
    progressedAt?: string
    updatedAt: string
  }
  relationships: {
    anime: {
      data: { id: string; type: 'anime' }
    }
  }
}

/**
 * Fetch the authenticated user's anime library from Kitsu.
 */
export async function fetchKitsuLibrary(token: string): Promise<KitsuLibraryEntry[]> {
  const url = `${KITSU_API_URL}/library-entries?filter[kind]=anime&filter[status]=current,completed,dropped,on_hold,planned&include=anime&page[limit]=500`

  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.api+json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Kitsu API error: ${response.statusText}`)
  }

  const data = (await response.json()) as { data: KitsuLibraryEntry[] }
  return data.data
}
