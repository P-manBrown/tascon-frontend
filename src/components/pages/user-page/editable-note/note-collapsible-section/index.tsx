'use client'

import { CollapsibleSection } from '@/components/collapsible-sections/collapsible-section'

type Props = Pick<
  React.ComponentProps<typeof CollapsibleSection>,
  'minHeight' | 'children'
>

export function NoteCollapsibleSection({ minHeight, children }: Props) {
  return (
    <CollapsibleSection minHeight={minHeight} className="z-10">
      {children}
    </CollapsibleSection>
  )
}
