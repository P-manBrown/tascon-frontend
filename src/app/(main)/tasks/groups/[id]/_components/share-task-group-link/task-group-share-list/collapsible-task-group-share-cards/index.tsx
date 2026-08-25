import { TaskGroupShareCardsCollapsibleSection } from "../../task-group-share-cards-collapsible-section";
import type { RequestHandoverButton } from "../task-group-share-card/request-handover-button";
import { TaskGroupShareCards } from "../task-group-share-cards";

type Props = Pick<
  React.ComponentProps<typeof TaskGroupShareCards>,
  "taskGroupShares"
> &
  Pick<React.ComponentProps<typeof RequestHandoverButton>, "taskGroupId"> &
  Pick<
    React.ComponentProps<typeof TaskGroupShareCardsCollapsibleSection>,
    "minHeight"
  >;

export function CollapsibleTaskGroupShareCards({
  taskGroupShares,
  taskGroupId,
  minHeight,
}: Props) {
  return (
    <TaskGroupShareCardsCollapsibleSection minHeight={minHeight}>
      <div className="p-4">
        <TaskGroupShareCards
          taskGroupShares={taskGroupShares}
          taskGroupId={taskGroupId}
        />
      </div>
    </TaskGroupShareCardsCollapsibleSection>
  );
}
