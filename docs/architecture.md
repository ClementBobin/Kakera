# Architecture

## Overview

Kakera is built on [Tauri v2](https://tauri.app), which combines a Rust backend with a React/TypeScript frontend rendered in a native WebView.

```
┌─────────────────────────────────────────────────────────────┐
│                       React Frontend                         │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐  │
│  │ Library  │  │ Calendar │  │  Settings │  │  Sync    │  │
│  │ Feature  │  │ Feature  │  │  Feature  │  │  Feature │  │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └────┬─────┘  │
│       └─────────────┴──────────────┴───────────────┘        │
│                   TanStack Query Cache                        │
│                   Zustand Stores                              │
└─────────────────────────┬───────────────────────────────────┘
                           │ Tauri IPC (invoke)
┌─────────────────────────▼───────────────────────────────────┐
│                       Rust Backend                           │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │  library   │  │   player   │  │       settings       │  │
│  │  commands  │  │  commands  │  │       commands       │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
│                   SQLite (local store)                        │
└─────────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼─────────────────┐
          ▼                ▼                 ▼
      AniList API      MAL API          Kitsu API
```

## Data Flow

1. **Tracking service API → Sync command**  
   When the user triggers a sync, the Rust `sync_library` command calls the relevant tracking service's HTTP API (AniList GraphQL, MAL REST, Kitsu JSON:API).

2. **Sync command → SQLite local store**  
   The sync command normalises responses into `AnimeEntry` structs and persists them to an SQLite database stored in the app data directory (`$APPDATA`).

3. **SQLite → React Query cache**  
   The React frontend calls the `get_library` Tauri command via `@tauri-apps/api/core`. TanStack Query caches the result and makes it available to all components.

4. **React Query cache → UI**  
   Components consume the query cache through custom hooks (e.g. `useLibrary`). Sorting, filtering, and search are computed client-side from the cached list.

## Feature Module Structure

Each feature lives under `src/features/<name>/` and follows this layout:

```
features/library/
├── __tests__/         # Vitest unit tests
├── components/        # Feature-specific React components
├── hooks/             # Feature-specific hooks (useLibrary, etc.)
├── utils/             # Pure utility functions (sort, filter, etc.)
└── index.ts           # Barrel export
```

Features communicate through:
- **Zustand stores** (`src/stores/`) for global UI state
- **TanStack Query** for server/command data
- **Tauri IPC** for Rust command invocations

## Tauri IPC

All Rust commands are invoked from the frontend using:

```ts
import { invoke } from '@tauri-apps/api/core'

const library = await invoke<AnimeEntry[]>('get_library')
```

Commands are defined in `src-tauri/src/commands/` and registered in `src-tauri/src/lib.rs`.
