import { UserModal } from './_components/user-modal'

type Props = {
  children: React.ReactNode
}

export default function AccountModalLayout({ children }: Props) {
  return (
    <UserModal>
      <div className="w-full md:w-[40rem]">{children}</div>
    </UserModal>
  )
}
