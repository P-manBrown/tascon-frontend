"use client";

import { TaskErrorPage } from "@/components/pages/task-error-page";
import type { ErrorProps } from "@/types/error";

export default function ErrorBoundary(props: ErrorProps) {
  return (
    <div className="p-20">
      {/* Forwarding the typed props to the underlying element is intended. */}
      {/* nosemgrep: react-props-spreading */}
      <TaskErrorPage {...props} />
    </div>
  );
}
