export function generatePaginationState(
  currentPage: number,
  totalPages: number,
  maxVisible: number,
) {
  function createPageRange(start: number, length: number): number[] {
    return Array.from({ length }, (_, i) => start + i)
  }

  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  const isAllPagesVisible = totalPages <= maxVisible
  if (isAllPagesVisible) {
    return {
      pages: createPageRange(1, totalPages),
      isFirstPageVisible: false,
      isLastPageVisible: false,
      isStartEllipsisVisible: false,
      isEndEllipsisVisible: false,
      isFirstPage,
      isLastPage,
    }
  }

  const halfVisible = Math.floor(maxVisible / 2)

  const isNearStart = currentPage <= halfVisible + 1
  if (isNearStart) {
    return {
      pages: createPageRange(1, maxVisible - 1),
      isFirstPageVisible: false,
      isLastPageVisible: true,
      isStartEllipsisVisible: false,
      isEndEllipsisVisible: true,
      isFirstPage,
      isLastPage,
    }
  }

  const isNearEnd = currentPage >= totalPages - halfVisible
  if (isNearEnd) {
    const startPage = totalPages - maxVisible + 2
    return {
      pages: createPageRange(startPage, maxVisible - 1),
      isFirstPageVisible: true,
      isLastPageVisible: false,
      isStartEllipsisVisible: true,
      isEndEllipsisVisible: false,
      isFirstPage,
      isLastPage,
    }
  }

  const middlePageCount = maxVisible - 2
  const middleStartPage = currentPage - Math.floor(middlePageCount / 2)
  return {
    pages: createPageRange(middleStartPage, middlePageCount),
    isFirstPageVisible: true,
    isLastPageVisible: true,
    isStartEllipsisVisible: true,
    isEndEllipsisVisible: true,
    isFirstPage,
    isLastPage,
  }
}
