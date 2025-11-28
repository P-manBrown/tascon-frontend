type Props = {
  children: React.ReactNode
}

export function TaskListLayout({ children }: Props) {
  return <div className="h-full min-h-0 pt-3">{children}</div>
}
