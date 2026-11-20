"use client";

import { PageSelector } from "../../page-selector";

type Props = Pick<
  React.ComponentProps<typeof PageSelector>,
  "currentPage" | "totalPages"
>;

export function MobilePageSelector(props: Props) {
  // Forwarding the typed props to the underlying element is intended.
  // nosemgrep: react-props-spreading
  return <PageSelector {...props} />;
}
