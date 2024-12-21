// See https://is.gd/4CpzNm

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import type { ReadonlyURLSearchParams } from 'next/navigation'

type Props = {
  searchParamsRef: React.RefObject<ReadonlyURLSearchParams | null>
}

export function SearchParamsLoader(props: Props) {
  return (
    <Suspense>
      <SearchParamsLoaderInner {...props} />
    </Suspense>
  )
}

function SearchParamsLoaderInner({ searchParamsRef }: Props) {
  const searchParams = useSearchParams()

  useEffect(() => {
    searchParamsRef.current = searchParams
  }, [searchParams, searchParamsRef])

  return null
}
