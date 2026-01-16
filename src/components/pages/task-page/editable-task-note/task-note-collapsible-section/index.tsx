'use client'

import { CollapsibleSection } from '@/components/collapsible-sections/collapsible-section'

type Props = Pick<
  React.ComponentProps<typeof CollapsibleSection>,
  'minHeight' | 'children'
>

export function TaskNoteCollapsibleSection({ minHeight, children }: Props) {
  return (
    <CollapsibleSection minHeight={minHeight} className="z-10">
      {children}
    </CollapsibleSection>
  )
}
