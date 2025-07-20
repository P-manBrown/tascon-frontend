type Props = {
  children: React.ReactNode
}

export function SidebarHeading({ children }: Props) {
  return <h2 className="font-bold md:text-lg">{children}</h2>
}
