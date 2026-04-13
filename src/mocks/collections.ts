import type { CustomCollection } from '@/types/collection'

export const MOCK_COLLECTIONS: CustomCollection[] = [
  {
    id: 'col-1',
    name: 'Isekai Stash',
    description: 'Another world, another problem — and I love it.',
    animeIds: ['9', '17', '18'],
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-03-20T14:30:00.000Z',
    color: '#7c3aed',
    icon: '🌀',
  },
  {
    id: 'col-2',
    name: 'Movie Night',
    description: null,
    animeIds: ['13'],
    createdAt: '2024-02-01T08:00:00.000Z',
    updatedAt: '2024-02-01T08:00:00.000Z',
    color: '#dc2626',
    icon: '🎬',
  },
  {
    id: 'col-3',
    name: 'On Hold',
    description: 'Will get back to these eventually… probably.',
    animeIds: ['7', '17'],
    createdAt: '2024-03-10T12:00:00.000Z',
    updatedAt: '2024-04-01T09:00:00.000Z',
    color: '#d97706',
    icon: '⏸️',
  },
]
