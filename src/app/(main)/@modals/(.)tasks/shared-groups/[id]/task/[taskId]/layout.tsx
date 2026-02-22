import { TaskModal } from '@/app/(main)/@modals/(.)tasks/detail/[id]/_components/task-modal'

type Props = {
  children: React.ReactNode
}

export default function SharedTaskModalLayout({ children }: Props) {
  return (
    <TaskModal>
      <div className="w-full md:w-160">{children}</div>
    </TaskModal>
  )
}
