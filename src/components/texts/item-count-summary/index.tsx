type Props = {
  currentCount: React.ReactNode
  totalCount: React.ReactNode
  className?: string
}

export function ItemCountSummary({
  currentCount,
  totalCount,
  className,
}: Props) {
  return (
    <p className={className}>
      （{currentCount}件 / {totalCount}件）
    </p>
  )
}

type LoadingItemCountSummaryProps = Pick<Props, 'className'>

export function LoadingItemCountSummary({
  className = '',
}: LoadingItemCountSummaryProps) {
  return <div className={`skeleton mx-2 h-5 w-24 rounded-full ${className}`} />
}
