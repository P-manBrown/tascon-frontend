import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'
import { IconButton } from '@/components/buttons/icon-button'
import { useSnackbar } from './use-snackbar'
import { useSnackbarsStore } from '../use-snackbars-store'

type Props = {
  id: number
  severity: 'success' | 'error'
  isOpen: boolean
  message: string
  actionButton?: React.ReactElement
}

const iconBaseClasses =
  'inline-flex size-8 flex-shrink-0 items-center justify-center rounded-md'
const iconClasses = 'size-6'

export function Snackbar({
  id,
  severity,
  isOpen,
  message,
  actionButton,
}: Props) {
  const { ref, handleAnimationEnd } = useSnackbar({ id, isOpen, actionButton })
  const closeSnackbar = useSnackbarsStore((state) => state.closeSnackbar)

  const getIcon = () => {
    switch (severity) {
      case 'success':
        return (
          <div className={`${iconBaseClasses} bg-green-700`}>
            <CheckCircleIcon className={`${iconClasses} fill-white`} />
          </div>
        )
      case 'error':
        return (
          <div className={`${iconBaseClasses} bg-red-600`}>
            <XCircleIcon className={`${iconClasses} fill-white`} />
          </div>
        )
    }
  }

  return (
    <div
      ref={ref}
      className={`inset-auto top-0 m-auto w-full bg-gray-900 p-4 md:bottom-7 md:left-7 md:top-auto md:w-auto md:rounded md:shadow-lg md:shadow-black/40 ${
        isOpen
          ? 'animate-slide-in-top md:animate-slide-in-bottom'
          : 'animate-slide-out-top md:animate-slide-out-bottom'
      }`}
      popover="manual"
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="flex items-center space-x-3">
        {getIcon()}
        <div className="flex max-md:flex-col max-md:space-y-1 md:items-center md:space-x-3">
          <p className="text-white">{message}</p>
          <span className="[&>a]:text-sky-200">{actionButton}</span>
        </div>
        {actionButton && (
          <IconButton
            aria-label="通知バナーを閉じる"
            onClick={() => closeSnackbar(id)}
            className="hover:bg-white/20"
          >
            <XMarkIcon className="size-5 fill-white" />
          </IconButton>
        )}
      </div>
    </div>
  )
}
