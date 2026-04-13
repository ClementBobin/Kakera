const ANILIST_API_URL = 'https://graphql.anilist.co'

export interface AniListAnime {
  id: number
  title: {
    romaji: string
    english?: string
    native?: string
  }
  episodes?: number
  meanScore?: number
  genres: string[]
  coverImage: {
    large?: string
    medium?: string
  }
  status: string
}

export interface AniListMediaListEntry {
  id: number
  status: string
  score: number
  progress: number
  updatedAt: number
  media: AniListAnime
}

export async function fetchAniListLibrary(token: string, userName: string): Promise<AniListMediaListEntry[]> {
  const query = `
    query ($userName: String) {
      MediaListCollection(userName: $userName, type: ANIME) {
        lists {
          entries {
            id
            status
            score
            progress
            updatedAt
            media {
              id
              title { romaji english native }
              episodes
              meanScore
              genres
              coverImage { large medium }
              status
            }
          }
        }
      }
    }
  `

  const response = await fetch(ANILIST_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables: { userName } }),
  })

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.statusText}`)
  }

  const data = (await response.json()) as {
    data: {
      MediaListCollection: {
        lists: { entries: AniListMediaListEntry[] }[]
      }
    }
  }

  return data.data.MediaListCollection.lists.flatMap((list) => list.entries)
}
