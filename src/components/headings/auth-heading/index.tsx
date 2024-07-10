type Props = {
  className?: string
  children: string
}

export function AuthHeading({ className = '', children }: Props) {
  return (
    <h1 className={`text-center text-3xl font-bold ${className}`}>
      {children}
    </h1>
  )
}
