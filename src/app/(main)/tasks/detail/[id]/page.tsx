import type { Metadata } from "next";
import { TaskPage } from "@/components/pages/task-page";

export const metadata: Metadata = {
  title: "タスク詳細",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Task(props: Props) {
  const params = await props.params;
  const { id } = params;

  return <TaskPage id={id} />;
}
