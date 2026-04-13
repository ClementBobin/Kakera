import { LibraryFilters } from '@/features/library/LibraryFilters'
import { LibraryGrid } from '@/features/library/LibraryGrid'
import { LibraryToolbar } from '@/features/library/LibraryToolbar'
import { useLibraryQuery } from '@/hooks/useLibrary'

export default function LibraryPage() {
  const { isLoading } = useLibraryQuery()
  return (
    <div className="flex flex-col gap-4 h-full">
      <LibraryToolbar />
      <LibraryFilters />
      <LibraryGrid isLoading={isLoading} />
    </div>
  )
}
