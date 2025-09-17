'use client'

import { CollapsibleSection } from '@/components/collapsible-sections/collapsible-section'

type Props = Pick<React.ComponentProps<typeof CollapsibleSection>, 'children'>

export function ContactsCardsCollapsibleSection({ children }: Props) {
  return (
    <CollapsibleSection minHeight={484} initialIsCollapsible={true}>
      {children}
    </CollapsibleSection>
  )
}
