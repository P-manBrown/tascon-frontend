import { TaskGroupShareCardsCollapsibleSection } from "../../task-group-share-cards-collapsible-section";
import { TaskGroupShareCards } from "../task-group-share-cards";

type Props = Pick<
  React.ComponentProps<typeof TaskGroupShareCards>,
  "taskGroupShares" | "taskGroupId" | "disabled"
> &
  Pick<
    React.ComponentProps<typeof TaskGroupShareCardsCollapsibleSection>,
    "minHeight"
  >;

export function CollapsibleTaskGroupShareCards({
  taskGroupShares,
  taskGroupId,
  minHeight,
  disabled,
}: Props) {
  return (
    <TaskGroupShareCardsCollapsibleSection minHeight={minHeight}>
      <div className="p-4">
        <TaskGroupShareCards
          taskGroupShares={taskGroupShares}
          taskGroupId={taskGroupId}
          disabled={disabled}
        />
      </div>
    </TaskGroupShareCardsCollapsibleSection>
  );
}
