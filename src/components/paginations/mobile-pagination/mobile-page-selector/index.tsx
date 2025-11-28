'use client'

import { PageSelector } from '../../page-selector'

type Props = React.ComponentProps<typeof PageSelector>

export function MobilePageSelector(props: Props) {
  return <PageSelector {...props} />
}
