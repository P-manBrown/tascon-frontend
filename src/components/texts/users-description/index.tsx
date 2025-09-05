type Props = {
  children: React.ReactNode
}

export function UsersDescription({ children }: Props) {
  return <p className="text-sm">{children}</p>
}
