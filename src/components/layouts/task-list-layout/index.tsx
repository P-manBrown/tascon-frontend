type Props = {
  children: React.ReactNode
}

export function TaskListLayout({ children }: Props) {
  return <div className="flex h-full min-h-0 gap-5 pt-3">{children}</div>
}
