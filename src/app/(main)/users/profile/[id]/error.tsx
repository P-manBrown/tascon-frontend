"use client";

import { UserErrorPage } from "@/components/pages/user-error-page";
import type { ErrorProps } from "@/types/error";

export default function ErrorBoundary(props: ErrorProps) {
  // Forwarding the typed props to the underlying element is intended.
  // nosemgrep: react-props-spreading
  return <UserErrorPage {...props} />;
}
