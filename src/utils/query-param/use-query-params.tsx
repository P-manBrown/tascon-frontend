import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export function useQueryParams() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const cleanupQueryParams = useCallback(
    (keys: string[]) => {
      const params = new URLSearchParams(searchParams.toString())
      keys.forEach((key) => {
        params.delete(key)
      })
      const newParams = params.toString()

      let newUrl
      if (newParams) {
        newUrl = `${pathname}?${newParams}`
      } else {
        newUrl = pathname
      }

      history.replaceState(
        { ...history.state, as: newUrl, url: newUrl },
        '',
        newUrl
      )
    },
    [pathname, searchParams]
  )

  return { cleanupQueryParams }
}
