# API Reference

## AniList GraphQL Client (`src/lib/api/anilist.ts`)

### `fetchAniListLibrary(token: string): Promise<AniListMediaListEntry[]>`

Fetches the authenticated user's full anime list from the AniList GraphQL API.

**Parameters**

| Name | Type | Description |
|------|------|-------------|
| `token` | `string` | AniList OAuth2 Bearer token |

**Returns** an array of `AniListMediaListEntry` objects, each containing a `media` field with anime metadata and a `list_status` field with user-specific watch data.

**Errors** — throws if the HTTP request fails or if the AniList API returns an error.

---

## MyAnimeList Client (`src/lib/api/mal.ts`)

### `getMalAccessToken(clientId, code, codeVerifier): Promise<TokenResponse>`

Exchanges an OAuth2 authorization code (PKCE flow) for a MAL access token.

| Name | Type | Description |
|------|------|-------------|
| `clientId` | `string` | MAL application client ID |
| `code` | `string` | OAuth2 authorization code |
| `codeVerifier` | `string` | PKCE code verifier |

### `fetchMalLibrary(token: string): Promise<MalListEntry[]>`

Fetches the authenticated user's anime list from the MAL v2 REST API.

| Name | Type | Description |
|------|------|-------------|
| `token` | `string` | MAL OAuth2 Bearer token |

---

## Kitsu JSON:API Client (`src/lib/api/kitsu.ts`)

### `fetchKitsuLibrary(token: string): Promise<KitsuLibraryEntry[]>`

Fetches the authenticated user's anime library from the Kitsu JSON:API.

| Name | Type | Description |
|------|------|-------------|
| `token` | `string` | Kitsu OAuth2 Bearer token |

**Returns** an array of `KitsuLibraryEntry` objects.  
Each entry contains `attributes` (status, rating, progress) and a `relationships.anime` reference to the associated anime resource.
