"use client";

import { Button } from "@/components/buttons/button";
import { ErrorContent } from "@/components/contents/error-content";
import { ReportIssueLink } from "@/components/links/report-issue-link";
import type { ErrorProps } from "@/types/error";

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center max-md:mx-3">
      <div className="text-center">
        <p className="font-semibold text-3xl text-red-600 md:text-5xl">Error</p>
        <h1 className="mt-1.5 mb-3.5 font-bold text-3xl tracking-tight md:mt-3 md:mb-7 md:text-6xl">
          Something went wrong
        </h1>
        <ErrorContent
          message="画面の表示中にエラーが発生しました。"
          resetButton={
            <Button
              type="button"
              className="btn-success"
              onClick={() => reset()}
            >
              再読み込み
            </Button>
          }
          reportIssueLink={<ReportIssueLink info={`Digest: ${error.digest}`} />}
        />
      </div>
    </main>
  );
}
