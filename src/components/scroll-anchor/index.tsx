'use client'

import { useRef, useEffect } from 'react'

type Props = {
  page: string
}

// TEMP: https://github.com/vercel/next.js/issues/74485
export function ScrollAnchor({ page }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const pageRef = useRef(page)

  useEffect(() => {
    if (page !== pageRef.current) {
      ref.current?.scrollIntoView()
      pageRef.current = page
    }
  }, [page])

  return <div ref={ref} />
}
