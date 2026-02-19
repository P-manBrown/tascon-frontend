import { CreateTaskModal } from './_components/create-task-modal'

type Props = {
  children: React.ReactNode
}

export default function CreateTaskModalLayout({ children }: Props) {
  return (
    <CreateTaskModal>
      <div className="w-full md:w-160">{children}</div>
    </CreateTaskModal>
  )
}
