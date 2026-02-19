'use client'

import { PageSelector } from '../../page-selector'

type Props = Pick<
  React.ComponentProps<typeof PageSelector>,
  'currentPage' | 'totalPages'
>

export function MobilePageSelector(props: Props) {
  return <PageSelector {...props} />
}
