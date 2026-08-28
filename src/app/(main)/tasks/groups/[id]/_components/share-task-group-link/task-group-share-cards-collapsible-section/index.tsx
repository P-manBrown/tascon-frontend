"use client";

import { CollapsibleSection } from "@/components/collapsible-sections/collapsible-section";

type Props = Pick<
  React.ComponentProps<typeof CollapsibleSection>,
  "children" | "minHeight"
>;

export function TaskGroupShareCardsCollapsibleSection({
  children,
  minHeight,
}: Props) {
  return (
    <CollapsibleSection minHeight={minHeight} initialIsCollapsible={true}>
      {children}
    </CollapsibleSection>
  );
}
