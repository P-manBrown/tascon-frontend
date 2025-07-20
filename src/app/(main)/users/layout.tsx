type Props = {
  children: React.ReactNode
  modal: React.ReactNode
}

export default async function UsersLayout({ children, modal }: Props) {
  return (
    <div className="flex h-full w-full">
      <main className="flex-grow overflow-auto p-4">{children}</main>
      {modal}
    </div>
  )
}
