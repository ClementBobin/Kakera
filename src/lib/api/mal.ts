const MAL_API_URL = 'https://api.myanimelist.net/v2'

export interface MalAnime {
  id: number
  title: string
  main_picture?: {
    medium: string
    large: string
  }
  num_episodes?: number
  mean?: number
  genres?: { id: number; name: string }[]
  status?: string
}

export interface MalListEntry {
  node: MalAnime
  list_status: {
    status: string
    score: number
    num_episodes_watched: number
    updated_at: string
  }
}

/**
 * Exchange an OAuth authorization code for a MAL access token.
 */
export async function getMalAccessToken(
  clientId: string,
  code: string,
  codeVerifier: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const response = await fetch('https://myanimelist.net/v1/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      code_verifier: codeVerifier,
    }),
  })

  if (!response.ok) {
    throw new Error(`MAL OAuth error: ${response.statusText}`)
  }

  return response.json() as Promise<{
    access_token: string
    refresh_token: string
    expires_in: number
  }>
}

/**
 * Fetch the authenticated user's anime list from MyAnimeList.
 */
export async function fetchMalLibrary(token: string): Promise<MalListEntry[]> {
  const fields = 'id,title,main_picture,num_episodes,mean,genres,status'
  const url = `${MAL_API_URL}/users/@me/animelist?fields=${fields}&limit=1000`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error(`MAL API error: ${response.statusText}`)
  }

  const data = (await response.json()) as { data: MalListEntry[] }
  return data.data
}
