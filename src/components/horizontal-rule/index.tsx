type Props = {
  className?: string
  children?: string
}

const hrClasses = 'w-full border-gray-400'

export function HorizontalRule({ className = '', children }: Props) {
  return children ? (
    <div
      className={`relative -mx-2 flex h-6 items-center justify-center ${className}`}
    >
      <hr className={hrClasses} />
      <span className="absolute bg-white px-2 text-gray-500">{children}</span>
    </div>
  ) : (
    <div className={`-mx-2 ${className}`}>
      <hr className={hrClasses} />
    </div>
  )
}
