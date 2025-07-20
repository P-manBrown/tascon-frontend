import { MainHeader } from './_components/main-header'

type Props = {
  children: React.ReactNode
  modal: React.ReactNode
}

export default function MainLayout({ children, modal }: Props) {
  return (
    <div className="flex h-dvh flex-col">
      <MainHeader />
      {/* 'id' controls 'overflow-hidden' style on the body element. */}
      <div id="main" className="px-safe flex-grow overflow-hidden">
        {children}
        {modal}
      </div>
    </div>
  )
}
