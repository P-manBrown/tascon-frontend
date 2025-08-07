import { Suspense } from 'react'
import { UsersSidebar } from './_components/users-sidebar'

type Props = {
  children: React.ReactNode
  modal: React.ReactNode
}

export default async function UsersLayout({ children, modal }: Props) {
  return (
    <div className="flex h-full">
      <Suspense fallback={null}>
        <UsersSidebar />
      </Suspense>
      <main className="flex-grow overflow-auto p-5 max-md:min-w-dvw md:px-10 md:py-5">
        {children}
      </main>
      {modal}
    </div>
  )
}
