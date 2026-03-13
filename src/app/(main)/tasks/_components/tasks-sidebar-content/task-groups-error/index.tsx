"use client";

import { XCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { useErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/buttons/button";
import { ReportIssueLink } from "@/components/links/report-issue-link";

type Props = {
  error: unknown;
};

const hasDigest = (err: unknown): err is Error & { digest: string } =>
  err instanceof Error && "digest" in err && typeof err.digest === "string";

export function TaskGroupsError({ error }: Props) {
  const { resetBoundary } = useErrorBoundary();
  const router = useRouter();

  const handleButtonClick = () => {
    startTransition(() => {
      resetBoundary();
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-sm border border-red-300 bg-red-50 p-3 max-md:items-center">
      <div className="flex items-center gap-1.5">
        <XCircleIcon className="size-5 stroke-2 stroke-red-600" />
        <p className="font-bold text-lg">Error</p>
      </div>
      <p className="text-sm">タスクグループの表示中に問題が発生しました。</p>
      <Button
        type="button"
        className="btn-success mx-auto my-3 h-8 max-w-44 font-medium text-sm"
        onClick={handleButtonClick}
      >
        再読み込み
      </Button>
      <ReportIssueLink
        className="mx-auto text-sm"
        info={hasDigest(error) ? `Digest: ${error.digest}` : undefined}
      />
    </div>
  );
}
