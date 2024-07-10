type Props = {
  children: React.ReactNode
}

export function DetailItemContentLayout({ children }: Props) {
  return <div className="px-2 py-1">{children}</div>
}
