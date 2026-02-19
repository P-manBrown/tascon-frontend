import { TaskModal } from './_components/task-modal'

type Props = {
  children: React.ReactNode
}

export default function TaskModalLayout({ children }: Props) {
  return (
    <TaskModal>
      <div className="w-full md:w-160">{children}</div>
    </TaskModal>
  )
}
