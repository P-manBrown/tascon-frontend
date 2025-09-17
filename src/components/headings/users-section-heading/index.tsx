type Props = {
  icon: React.ReactNode
  children: React.ReactNode
}

export function UsersSectionHeading({ icon, children }: Props) {
  return (
    <h2 className="flex items-center gap-2">
      {icon}
      <span className="text-lg font-bold">{children}</span>
    </h2>
  )
}
