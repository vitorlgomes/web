import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from './ui/button'

interface PaginationProps {
  pageIndex: number
  hasNextPage: boolean
  onPageChange: (page: number) => void
}

export function Pagination({
  pageIndex,
  hasNextPage,
  onPageChange,
}: PaginationProps) {
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0) {
      onPageChange(newPage)
    }
  }

  return (
    <div className="flex items-center justify-end gap-4">
      <span className="text-sm font-medium">Página {pageIndex + 1}</span>
      <Button
        variant="outline"
        className="h-8 w-8 p-0"
        onClick={() => handlePageChange(pageIndex - 1)}
        disabled={pageIndex === 0}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Página anterior</span>
      </Button>
      <Button
        variant="outline"
        className="h-8 w-8 p-0"
        onClick={() => handlePageChange(pageIndex + 1)}
        disabled={!hasNextPage}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Próxima página</span>
      </Button>
    </div>
  )
}
