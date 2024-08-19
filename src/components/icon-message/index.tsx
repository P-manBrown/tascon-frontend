import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

type Props = {
  severity: 'success' | 'warning' | 'error'
  title: string
  children: React.ReactNode
}

const iconClasses = 'mx-auto -mt-3 mb-3 size-24 stroke-1'

export function IconMessage({ title, severity, children }: Props) {
  const getIcon = () => {
    switch (severity) {
      case 'success':
        return <CheckCircleIcon className={`${iconClasses} stroke-green-700`} />
      case 'warning':
        return (
          <ExclamationTriangleIcon
            className={`${iconClasses} fill-yellow-300 stroke-gray-600`}
          />
        )
      case 'error':
        return <XCircleIcon className={`${iconClasses} stroke-red-600`} />
    }
  }

  return (
    <div>
      {getIcon()}
      <h2 className="mb-5 text-center text-2xl font-bold">{title}</h2>
      {children}
    </div>
  )
}
