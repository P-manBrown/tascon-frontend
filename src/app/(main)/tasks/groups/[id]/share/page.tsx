import { TaskGroupNameHeading } from "@/components/headings/task-group-name-heading";
import TasksLayout from "@/components/layouts/tasks-layout";
import { getTaskGroup } from "@/utils/api/get-task-group";
import { ShareTaskGroupPageContent } from "../_components/share-task-group-page-content";

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
      <div className="mb-3">
        <TaskGroupNameHeading>{`共有：${taskGroup.name}`}</TaskGroupNameHeading>
      </div>
      <ShareTaskGroupPageContent taskGroupId={id} page={page} />
    </TasksLayout>
  );
}
