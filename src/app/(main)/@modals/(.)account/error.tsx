"use client";

import { AccountErrorPage } from "@/components/pages/account-error-page";
import type { ErrorProps } from "@/types/error";

export default function ErrorBoundary(props: ErrorProps) {
  // Forwarding the typed props to the underlying element is intended.
  // nosemgrep: react-props-spreading
  return <AccountErrorPage {...props} />;
}
