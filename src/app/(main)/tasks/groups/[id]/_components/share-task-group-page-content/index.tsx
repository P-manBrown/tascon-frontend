import { Suspense } from "react";
import { HorizontalRule } from "@/components/horizontal-rule";
import ShareTaskGroupContactList, {
  LoadingShareTaskGroupContactList,
} from "../share-task-group-link/share-task-group-contact-list";
import { TaskGroupShareCardsCollapsibleSection } from "../share-task-group-link/task-group-share-cards-collapsible-section";
import TaskGroupShareList, {
  LoadingTaskGroupShareList,
} from "../share-task-group-link/task-group-share-list";

type Props = {
  taskGroupId: string;
  page: string;
};

export function ShareTaskGroupPageContent({ taskGroupId, page }: Props) {
  return (
    <div>
      <TaskGroupShareCardsCollapsibleSection>
        <Suspense fallback={<LoadingTaskGroupShareList />}>
          <TaskGroupShareList taskGroupId={taskGroupId} />
        </Suspense>
      </TaskGroupShareCardsCollapsibleSection>
      <HorizontalRule className="my-6" />
      <Suspense key={page} fallback={<LoadingShareTaskGroupContactList />}>
        <ShareTaskGroupContactList taskGroupId={taskGroupId} page={page} />
      </Suspense>
    </div>
  );
}
