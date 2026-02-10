import { Suspense } from 'react'
import { TasksSidebar } from './_components/tasks-sidebar'
import { TasksSidebarContent } from './_components/tasks-sidebar-content'

type Props = {
  children: React.ReactNode
}

export default function TasksLayout({ children }: Props) {
  return (
    <div className="flex h-full">
      <Suspense fallback={null}>
        <TasksSidebar>
          <TasksSidebarContent />
        </TasksSidebar>
      </Suspense>
      <main className="grow overflow-auto p-5 max-md:min-w-dvw md:px-9 md:py-5">
        {children}
      </main>
    </div>
  )
}
