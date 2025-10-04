import { getTaskGroups } from './get-task-groups.api'
import { TaskGroupNavLinks } from './task-group-nav-links'

const navLinksLayoutClasses = 'space-y-2 md:space-y-1'
const linkSizeClasses = 'w-full px-4 py-1'

export async function TaskGroupMenu() {
  const { taskGroups } = await getTaskGroups()

  return (
    <nav>
      <TaskGroupNavLinks
        taskGroups={taskGroups}
        className={navLinksLayoutClasses}
        linkSizeClasses={linkSizeClasses}
      />
    </nav>
  )
}

const itemCount = 15

export function LoadingTaskGroupMenu() {
  return (
    <div className={navLinksLayoutClasses}>
      {Array.from({ length: itemCount }).map((_, index) => {
        const opacity = 1 - (index / itemCount) * 0.9
        return (
          <div key={index} className={linkSizeClasses}>
            <span
              className="skeleton my-0.5 block h-5 w-full rounded-full"
              style={{ opacity }}
            />
          </div>
        )
      })}
    </div>
  )
}
