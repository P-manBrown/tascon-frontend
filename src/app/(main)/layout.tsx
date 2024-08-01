import { MainHeader } from './_components/main-header'

type Props = {
  children: React.ReactNode
  modal: React.ReactNode
}

export default function MainLayout({ children, modal }: Props) {
  return (
    <div className="flex max-h-[100dvh] flex-col">
      <MainHeader />
      {/* 'id' controls 'overflow-hidden' style on the body element. */}
      <main id="main" className="flex-grow overflow-scroll px-safe">
        {children}
        {modal}
      </main>
    </div>
  )
}
