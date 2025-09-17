type Props = {
  children: React.ReactNode
}

export function UsersSectionHeadingLayout({ children }: Props) {
  return (
    <div className="has-[>:nth-child(2)]:flex has-[>:nth-child(2)]:items-center">
      {children}
    </div>
  )
}
