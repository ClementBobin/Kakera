import { useState } from 'react'
import { CollectionList } from '@/features/collections/CollectionList'
import { CollectionDetail } from '@/features/collections/CollectionDetail'

export default function CollectionsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (selectedId) {
    return <CollectionDetail collectionId={selectedId} onBack={() => setSelectedId(null)} />
  }

  return <CollectionList onSelect={setSelectedId} />
}
