import { getTaskGroupShare } from "../get-task-group-share.api";
import { PendingHandoverButton } from "./pending-handover-button";

type Props = {
  id: string;
};

const shapeClasses = "h-8 w-40 rounded-sm max-sm:w-8";

export async function TaskGroupShareHandoverNotice({ id }: Props) {
  const { taskGroupShare } = await getTaskGroupShare(id);

  if (taskGroupShare.status !== "handover_pending") {
    return null;
  }

  return <PendingHandoverButton shareId={id} shapeClasses={shapeClasses} />;
}

export function LoadingTaskGroupShareHandoverNotice() {
  return <div className={`skeleton ${shapeClasses}`} />;
}
