type Props = {
  className?: string
  children: React.ReactNode
}

export function BottomBar({ className = '', children }: Props) {
  return (
    <div
      className={`bg-theme pb-safe fixed bottom-0 flex w-full items-center justify-center border-t border-gray-200 ${className}`}
    >
      <div className="my-2.5">{children}</div>
    </div>
  )
}
