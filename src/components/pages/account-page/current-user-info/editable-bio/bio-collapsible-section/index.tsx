'use client'

import { CollapsibleSection } from '@/components/collapsible-section'

type Props = Pick<
  React.ComponentProps<typeof CollapsibleSection>,
  'height' | 'children'
>

export function BioCollapsibleSection({ height, children }: Props) {
  return (
    <CollapsibleSection height={height} className="z-10">
      {children}
    </CollapsibleSection>
  )
}
