// See https://is.gd/4CpzNm

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import type { ReadonlyURLSearchParams } from 'next/navigation'

type Props = {
  onParamsReceived: (searchParams: ReadonlyURLSearchParams) => void
}

export function SearchParamsLoader(props: Props) {
  return (
    <Suspense>
      <SearchParamsLoaderInner {...props} />
    </Suspense>
  )
}

function SearchParamsLoaderInner({ onParamsReceived }: Props) {
  const searchParams = useSearchParams()

  useEffect(() => {
    onParamsReceived(searchParams)
  }, [onParamsReceived, searchParams])

  return null
}
