import { Suspense } from "react";
import { ShareSectionHeading } from "@/components/headings/share-section-heading";
import { HorizontalRule } from "@/components/horizontal-rule";
import ShareTaskGroupContactList, {
  LoadingShareTaskGroupContactList,
} from "../share-task-group-link/share-task-group-contact-list";
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
      <div className="mb-3">
        <ShareSectionHeading>共有中</ShareSectionHeading>
      </div>
      <Suspense fallback={<LoadingTaskGroupShareList />}>
        <TaskGroupShareList taskGroupId={taskGroupId} />
      </Suspense>
      <HorizontalRule className="my-6" />
      <div className="mb-3">
        <ShareSectionHeading>未共有</ShareSectionHeading>
      </div>
      <Suspense key={page} fallback={<LoadingShareTaskGroupContactList />}>
        <ShareTaskGroupContactList taskGroupId={taskGroupId} page={page} />
      </Suspense>
    </div>
  );
}
