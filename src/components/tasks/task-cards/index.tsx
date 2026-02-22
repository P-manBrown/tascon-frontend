'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { generateFromUrlParam } from '@/utils/login-path/generate-from-url-param'
import { TaskCard } from './task-card'
import { TaskCardTaskGroupLink } from './task-card-task-group-link'

type Props = {
  tasks: Array<
    Omit<React.ComponentProps<typeof TaskCard>, 'href'> & {
      taskGroup?: React.ComponentProps<typeof TaskCardTaskGroupLink>
    }
  >
}

export function TaskCards({ tasks }: Props) {
  const pathname = usePathname()
  const params = useSearchParams()
  const fromUrl = generateFromUrlParam(pathname, params.toString())

  return (
    <div className="flex flex-col gap-2 md:gap-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          {...task}
          href={`/tasks/detail/${task.id}?${fromUrl}`}
        >
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
