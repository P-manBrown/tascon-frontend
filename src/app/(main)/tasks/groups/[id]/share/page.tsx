import { Suspense } from "react";
import TasksLayout from "@/components/layouts/tasks-layout";
import { ScrollAnchor } from "@/components/scroll-anchor";
import { getTaskGroup } from "@/utils/api/get-task-group";
import ShareTaskGroupContactList, {
  LoadingShareTaskGroupContactList,
} from "../_components/share-task-group-link/share-task-group-contact-list";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function ShareTaskGroupPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { page = "1" } = await searchParams;
  const { taskGroup } = await getTaskGroup(id);

  return (
    <TasksLayout>
      <ScrollAnchor page={page ?? "1"} />
      <h1 className="font-bold text-lg">{taskGroup.name}を共有</h1>
      <Suspense key={page} fallback={<LoadingShareTaskGroupContactList />}>
        <ShareTaskGroupContactList taskGroupId={id} page={page} />
      </Suspense>
    </TasksLayout>
  );
}
