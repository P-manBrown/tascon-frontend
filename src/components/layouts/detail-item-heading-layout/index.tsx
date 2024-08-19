type Props = {
  children: React.ReactNode
}

export function DetailItemHeadingLayout({ children }: Props) {
  return (
    <div className="mb-1.5 has-[>:nth-child(2)]:flex has-[>:nth-child(2)]:items-center has-[>:nth-child(2)]:gap-3">
      {children}
    </div>
  )
}
