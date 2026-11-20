"use client";

import { TaskCard } from "@/components/tasks/task-cards/task-card";

type Props = {
  shareId: string;
  tasks: Array<
    Omit<React.ComponentProps<typeof TaskCard>, "href" | "isReadonly">
  >;
};

export function SharedTaskCards({ shareId, tasks }: Props) {
  return (
    <div className="flex flex-col gap-2 md:gap-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          // Forwarding the typed props to the underlying element is intended.
          // nosemgrep: react-props-spreading
          {...task}
          href={`/tasks/shared-groups/${shareId}/task/${task.id}`}
          isReadonly={true}
        />
      ))}
    </div>
  );
}
