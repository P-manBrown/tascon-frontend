export function extractPaginationData(headers: Headers) {
  return {
    currentPage: headers.get('current-page'),
    pageItems: headers.get('page-items'),
    totalPages: headers.get('total-pages'),
    totalCount: headers.get('total-count'),
  }
}
