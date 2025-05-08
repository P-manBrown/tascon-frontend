type Props = {
  color: 'gray' | 'warning'
  className?: string
  children: string
}

const colorClasses = {
  gray: 'bg-gray-100',
  warning: 'text-yellow-300 bg-gray-600 font-semibold',
}

export function Tag({ className = '', color, children }: Props) {
  return (
    <span
      className={`rounded-sm border border-gray-200 px-2 py-0.5 text-xs ${colorClasses[color]} ${className}`}
    >
      {children}
    </span>
  )
}
