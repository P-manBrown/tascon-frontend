import { ShareTaskGroupPageContent } from "@/app/(main)/tasks/groups/[id]/_components/share-task-group-page-content";

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

  return <ShareTaskGroupPageContent taskGroupId={id} page={page ?? "1"} />;
}
