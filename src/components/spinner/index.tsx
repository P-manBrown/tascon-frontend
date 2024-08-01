type Props = {
  className: string
}

export function Spinner({ className = '' }: Props) {
  return (
    <span
      className={`inline-block aspect-square animate-spin rounded-full border-t-transparent ${className}`}
    />
  )
}
