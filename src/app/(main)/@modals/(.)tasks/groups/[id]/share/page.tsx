import { Suspense } from "react";
import ShareTaskGroupContactList, {
  LoadingShareTaskGroupContactList,
} from "@/app/(main)/tasks/groups/[id]/_components/share-task-group-button/share-task-group-contact-list";

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
    <Suspense fallback={<LoadingShareTaskGroupContactList />}>
      <ShareTaskGroupContactList taskGroupId={id} page={page ?? "1"} />
    </Suspense>
  );
}
