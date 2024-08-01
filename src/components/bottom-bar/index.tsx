type Props = {
  className?: string
  children: React.ReactNode
}

export function BottomBar({ className = '', children }: Props) {
  return (
    <div
      className={`fixed bottom-0 flex w-full items-center justify-center border-t bg-theme pb-safe ${className}`}
    >
      <div className="my-2.5">{children}</div>
    </div>
  )
}
