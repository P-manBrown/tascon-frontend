import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { Button } from "@/components/buttons/button";
import { ErrorContent } from "@/components/contents/error-content";
import { IconMessage } from "@/components/icon-message";
import { ReportIssueLink } from "@/components/links/report-issue-link";
import type { ErrorProps } from "@/types/error";

export function ShareTaskGroupErrorPage({ error, reset }: ErrorProps) {
  const router = useRouter();

  const handleClick = () => {
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  return (
    <IconMessage severity="error" title="Error">
      <ErrorContent
        message="タスクグループ共有画面の表示中に問題が発生しました。"
        resetButton={
          <Button type="button" className="btn-success" onClick={handleClick}>
            再読み込み
          </Button>
        }
        reportIssueLink={<ReportIssueLink info={`Digest: ${error.digest}`} />}
      />
    </IconMessage>
  );
}
