"use client";

import { ShareTaskGroupErrorPage } from "@/components/pages/share-task-group-error-page";
import type { ErrorProps } from "@/types/error";

export default function ErrorBoundary(props: ErrorProps) {
  return <ShareTaskGroupErrorPage {...props} />;
}
