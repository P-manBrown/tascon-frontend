type Props = {
  children: string
}

export function DetailSingleLineText({ children }: Props) {
  return (
    <p className="overflow-hidden text-ellipsis whitespace-nowrap">
      {children}
    </p>
  )
}

export function LoadingDetailSingleLineText() {
  return <div className="skeleton my-1 h-4 w-1/2 rounded-full" />
}
