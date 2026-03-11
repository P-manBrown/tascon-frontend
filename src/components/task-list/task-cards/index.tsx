import { TaskCard } from './task-card'
import { TaskCardTaskGroupLink } from './task-card-task-group-link'

type Props = Pick<React.ComponentProps<typeof TaskCard>, 'isReadonly'> & {
  tasks: Array<
    React.ComponentProps<typeof TaskCard> & {
      taskGroup?: React.ComponentProps<typeof TaskCardTaskGroupLink>
    }
  >
}

export function TaskCards({ tasks, isReadonly }: Props) {
  return (
    <div className="flex flex-col gap-2 md:gap-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} {...task} isReadonly={isReadonly}>
          {task.taskGroup !== undefined && (
            <div className="relative z-10 mt-3">
              <TaskCardTaskGroupLink
                id={task.taskGroup.id}
                name={task.taskGroup.name}
                icon={task.taskGroup.icon}
              />
            </div>
          )}
        </TaskCard>
      ))}
    </div>
  )
}
