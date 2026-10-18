import type { Metadata } from "next";
import { Suspense } from "react";
import {
  LoadingSharedTaskPage,
  SharedTaskPage,
} from "@/components/pages/shared-task-page";

export const metadata: Metadata = {
  title: "タスク詳細",
};

type Props = {
  params: Promise<{ id: string; taskId: string }>;
};

export default async function SharedTask(props: Props) {
  const params = await props.params;
  const { id, taskId } = params;

  return (
    <Suspense fallback={<LoadingSharedTaskPage />}>
      <SharedTaskPage shareId={id} taskId={taskId} />
    </Suspense>
  );
}
