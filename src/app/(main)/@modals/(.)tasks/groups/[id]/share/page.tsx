import { Suspense } from "react";
import ShareTaskGroupContactList, {
  LoadingShareTaskGroupContactList,
} from "@/app/(main)/tasks/groups/[id]/_components/share-task-group-link/share-task-group-contact-list";
import { TaskGroupShareCardsCollapsibleSection } from "@/app/(main)/tasks/groups/[id]/_components/share-task-group-link/task-group-share-cards-collapsible-section";
import TaskGroupShareList, {
  LoadingTaskGroupShareList,
} from "@/app/(main)/tasks/groups/[id]/_components/share-task-group-link/task-group-share-list";
import { HorizontalRule } from "@/components/horizontal-rule";

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function ShareTaskGroup({ params, searchParams }: Props) {
  const [{ id }, { page }] = await Promise.all([params, searchParams]);

  return (
    <div>
      <TaskGroupShareCardsCollapsibleSection>
        <Suspense fallback={<LoadingTaskGroupShareList />}>
          <TaskGroupShareList taskGroupId={id} />
        </Suspense>
      </TaskGroupShareCardsCollapsibleSection>
      <HorizontalRule className="my-6" />
      <Suspense key={page} fallback={<LoadingShareTaskGroupContactList />}>
        <ShareTaskGroupContactList taskGroupId={id} page={page ?? "1"} />
      </Suspense>
    </div>
  );
}
