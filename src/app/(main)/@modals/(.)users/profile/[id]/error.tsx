"use client";

import { UserErrorPage } from "@/components/pages/user-error-page";
import type { ErrorProps } from "@/types/error";

export default function ErrorBoundary(props: ErrorProps) {
  return <UserErrorPage {...props} />;
}
