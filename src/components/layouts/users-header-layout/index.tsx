type Props = {
  children: React.ReactNode
}

export function UsersHeaderLayout({ children }: Props) {
  return <div className="space-y-1">{children}</div>
}
