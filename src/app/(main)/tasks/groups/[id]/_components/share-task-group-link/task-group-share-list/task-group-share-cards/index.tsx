import {
  LoadingTaskGroupShareCard,
  TaskGroupShareCard,
} from "./task-group-share-card";

type Props = Pick<
  React.ComponentProps<typeof TaskGroupShareCard>,
  "taskGroupId" | "disabled"
> & {
  taskGroupShares: Array<
    React.ComponentProps<typeof TaskGroupShareCard>["share"]
  >;
};

const gridClasses = "grid gap-4 lg:grid-cols-2 xl:grid-cols-3";

export function TaskGroupShareCards({
  taskGroupShares,
  taskGroupId,
  disabled,
}: Props) {
  return (
    <div className={gridClasses}>
      {taskGroupShares.map((share) => (
        <TaskGroupShareCard
          key={share.id}
          share={share}
          taskGroupId={taskGroupId}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

type LoadingTaskGroupShareCardsProps = {
  limit: number;
};

export function LoadingTaskGroupShareCards({
  limit,
}: LoadingTaskGroupShareCardsProps) {
  return (
    <div className={gridClasses}>
      {Array.from({ length: limit }, (_, i) => i).map((index) => (
        <LoadingTaskGroupShareCard key={index} />
      ))}
    </div>
  );
}
