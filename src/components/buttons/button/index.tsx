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
        <span className="flex h-full w-full items-center justify-center">
          <Spinner className="mr-3 h-2/5 min-h-3.5 w-auto border-[3.5px] border-current" />
          処理中...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
