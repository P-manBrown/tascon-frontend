type Props = {
  children: string
}

type LoadingProps = {
  lines: number
}

export function DetailMultiLineText({ children }: Props) {
  return <p className="break-words whitespace-pre-wrap">{children}</p>
}

const widthClasses = ['w-3/5', 'w-full', 'w-5/12', 'w-4/5', 'w-4/6']

export function LoadingDetailMultiLineText({ lines }: LoadingProps) {
  return (
    <div className="my-1 space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`skeleton h-4 rounded-full ${
            widthClasses[i % widthClasses.length]
          }`}
        />
      ))}
    </div>
  )
}
