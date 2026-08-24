import { TaskGroupShareCardsCollapsibleSection } from "../../task-group-share-cards-collapsible-section";
import type { RequestHandoverButton } from "../task-group-share-card/request-handover-button";
import { TaskGroupShareCards } from "../task-group-share-cards";

type Props = Pick<
  React.ComponentProps<typeof TaskGroupShareCards>,
  "taskGroupShares"
> &
  Pick<React.ComponentProps<typeof RequestHandoverButton>, "taskGroupId">;

export function CollapsibleTaskGroupShareCards({
  taskGroupShares,
  taskGroupId,
}: Props) {
  return (
    <TaskGroupShareCardsCollapsibleSection>
      <div className="p-4">
        <TaskGroupShareCards
          taskGroupShares={taskGroupShares}
          taskGroupId={taskGroupId}
        />
      </div>
    </TaskGroupShareCardsCollapsibleSection>
  );
}
