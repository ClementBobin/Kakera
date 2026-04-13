/// <reference types="vite/client" />
export { MOCK_ANIME } from '@/mocks/anime'
export { MOCK_CALENDAR } from '@/mocks/calendar'
export { MOCK_COLLECTIONS } from '@/mocks/collections'
export { MOCK_SETTINGS } from '@/mocks/settings'
export const isMockMode = import.meta.env.VITE_USE_MOCKS === 'true'
