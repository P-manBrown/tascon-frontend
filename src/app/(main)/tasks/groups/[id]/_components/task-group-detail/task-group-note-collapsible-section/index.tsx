'use client'

import { CollapsibleSection } from '@/components/collapsible-sections/collapsible-section'

type Props = {
  children: React.ReactNode
}

export function TaskGroupNoteCollapsibleSection({ children }: Props) {
  return <CollapsibleSection minHeight={160}>{children}</CollapsibleSection>
}
