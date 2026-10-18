import { TaskGroupShareCard } from "../task-group-share-card";

type Props = Pick<
  React.ComponentProps<typeof TaskGroupShareCard>,
  "taskGroupId" | "disabled"
> & {
  taskGroupShares: Array<
    React.ComponentProps<typeof TaskGroupShareCard>["share"]
  >;
};

export function TaskGroupShareCards({
  taskGroupShares,
  taskGroupId,
  disabled,
}: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
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
