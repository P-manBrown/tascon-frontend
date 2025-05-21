import { Spinner } from '@/components/spinner'

type ButtonProps = Omit<
  React.ComponentPropsWithoutRef<'button'>,
  'disabled'
> & {
  status?: 'idle' | 'pending' | 'disabled'
}

export function Button({
  status = 'idle',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`btn ${className}`}
      disabled={status !== 'idle'}
      {...rest}
    >
      {status === 'pending' ? (
        <span className="flex h-full w-full items-center justify-center gap-1">
          <Spinner className="size-2/3" />
          処理中...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
