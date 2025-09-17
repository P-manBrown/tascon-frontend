'use client'

type Props = {
  children: React.ReactNode
}

export function UsersSectionHeaderLayout({ children }: Props) {
  return (
    <div className="has-[>:nth-child(2)]:flex has-[>:nth-child(2)]:items-center has-[>:nth-child(2)]:justify-between">
      {children}
    </div>
  )
}
