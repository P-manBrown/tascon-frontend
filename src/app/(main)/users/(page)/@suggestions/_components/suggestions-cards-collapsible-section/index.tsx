'use client'

import { CollapsibleSection } from '@/components/collapsible-sections/collapsible-section'

type Props = Pick<React.ComponentProps<typeof CollapsibleSection>, 'children'>

export function SuggestionsCardsCollapsibleSection({ children }: Props) {
  return (
    <CollapsibleSection minHeight={412} initialIsCollapsible={true}>
      {children}
    </CollapsibleSection>
  )
}
