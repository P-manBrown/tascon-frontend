import { TaskGroupShareCardsCollapsibleSection } from "../../task-group-share-cards-collapsible-section";
import { TaskGroupShareCards } from "../task-group-share-cards";

type Props = Pick<
  React.ComponentProps<typeof TaskGroupShareCards>,
  "taskGroupShares"
>;

export function CollapsibleTaskGroupShareCards({ taskGroupShares }: Props) {
  return (
    <TaskGroupShareCardsCollapsibleSection>
      <div className="p-4">
        <TaskGroupShareCards taskGroupShares={taskGroupShares} />
      </div>
    </TaskGroupShareCardsCollapsibleSection>
  );
}
