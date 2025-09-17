type Props = {
  children: React.ReactNode
}

export function UsersHeaderLayout({ children }: Props) {
  return <div className="has-[>:nth-child(2)]:space-y-1">{children}</div>
}
