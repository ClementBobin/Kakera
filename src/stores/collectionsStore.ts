import { create } from 'zustand'
import type { CustomCollection } from '@/types/collection'

interface CollectionsState {
  collections: CustomCollection[]
  setCollections: (collections: CustomCollection[]) => void
  addCollection: (collection: CustomCollection) => void
  updateCollection: (id: string, updates: Partial<CustomCollection>) => void
  deleteCollection: (id: string) => void
  addAnimeToCollection: (collectionId: string, animeId: string) => void
  removeAnimeFromCollection: (collectionId: string, animeId: string) => void
}

export const useCollectionsStore = create<CollectionsState>((set) => ({
  collections: [],
  setCollections: (collections) => set({ collections }),
  addCollection: (collection) =>
    set((state) => ({ collections: [...state.collections, collection] })),
  updateCollection: (id, updates) =>
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      ),
    })),
  deleteCollection: (id) =>
    set((state) => ({ collections: state.collections.filter((c) => c.id !== id) })),
  addAnimeToCollection: (collectionId, animeId) =>
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === collectionId && !c.animeIds.includes(animeId)
          ? { ...c, animeIds: [...c.animeIds, animeId], updatedAt: new Date().toISOString() }
          : c
      ),
    })),
  removeAnimeFromCollection: (collectionId, animeId) =>
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === collectionId
          ? { ...c, animeIds: c.animeIds.filter((id) => id !== animeId), updatedAt: new Date().toISOString() }
          : c
      ),
    })),
}))