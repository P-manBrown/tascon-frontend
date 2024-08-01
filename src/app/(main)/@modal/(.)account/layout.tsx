import { AccountModal } from './_components/account-modal'

type Props = {
  children: React.ReactNode
}

export default function AccountModalLayout({ children }: Props) {
  return (
    <AccountModal>
      <div className="w-full md:w-[40rem]">{children}</div>
    </AccountModal>
  )
}
