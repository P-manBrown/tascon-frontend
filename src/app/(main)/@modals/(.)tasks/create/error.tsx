"use client";

import { CreateTaskErrorPage } from "@/components/pages/create-task-error-page";
import type { ErrorProps } from "@/types/error";

export default function ErrorBoundary(props: ErrorProps) {
  // Forwarding the typed props to the underlying element is intended.
  // nosemgrep: react-props-spreading
  return <CreateTaskErrorPage {...props} />;
}
