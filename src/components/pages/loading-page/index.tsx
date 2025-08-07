const animationSquares = [
  { color: 'bg-ctnr-blue', position: '[--end-x:0px] [--end-y:-32px]' },
  { color: 'bg-ctnr-green', position: '[--end-x:32px] [--end-y:-32px]' },
  { color: 'bg-ctnr-yellow', position: '[--end-x:32px] [--end-y:0px]' },
  { color: 'bg-ctnr-purple', position: '[--end-x:32px] [--end-y:32px]' },
  { color: 'bg-ctnr-red', position: '[--end-x:0px] [--end-y:32px]' },
  { color: 'bg-ctnr-gray', position: '[--end-x:-32px] [--end-y:32px]' },
  { color: 'bg-ctnr-pink', position: '[--end-x:-32px] [--end-y:0px]' },
  { color: 'bg-ctnr-orange', position: '[--end-x:-32px] [--end-y:-32px]' },
]

type Props = {
  pageTitle: string
}

export function LoadingPage({ pageTitle }: Props) {
  return (
    <div className="animate-fade-in-delayed bg-theme relative flex h-full items-center justify-center rounded-xl">
      <div className="flex flex-col items-center gap-y-6">
        <div className="relative h-32 w-32">
          {animationSquares.map((square, i) => (
            <div
              key={i}
              className={`animate-expand-collapse absolute top-[calc(50%-12px)] left-[calc(50%-12px)] size-5 rounded-xs ${square.color} ${square.position}`}
            />
          ))}
        </div>
        <div className="space-y-3 text-center">
          <p className="text-lg leading-tight font-semibold text-gray-700">
            {pageTitle}を表示中...
          </p>
          <p className="animate-pulse text-gray-500 sm:text-sm">
            しばらくお待ちください
          </p>
        </div>
      </div>
    </div>
  )
}
