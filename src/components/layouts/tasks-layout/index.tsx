type Props = {
  children: React.ReactNode
}

export default async function TasksLayout({ children }: Props) {
  return <div className="flex h-full flex-col">{children}</div>
}
