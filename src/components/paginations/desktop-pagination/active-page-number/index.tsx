type Props = {
  className: string
  children: React.ReactNode
}

export function ActivePageNumber({ className, children }: Props) {
  return (
    <span
      className={`z-10 flex items-center justify-center border border-blue-600 bg-blue-50 text-sm font-medium text-blue-600 ${className}`}
    >
      {children}
    </span>
  )
}
