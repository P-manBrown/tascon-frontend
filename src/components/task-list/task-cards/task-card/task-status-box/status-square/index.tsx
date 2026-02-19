import { CheckIcon } from '@heroicons/react/24/outline'

type Props = {
  status: 'not_started' | 'in_progress' | 'completed'
}

function getColorClasses(status: Props['status']) {
  switch (status) {
    case 'completed':
      return 'bg-green-600'
    case 'in_progress':
      return 'bg-orange-500'
    case 'not_started':
      return 'border-2 border-gray-400 bg-gray-100'
  }
}

export function StatusSquare({ status }: Props) {
  return (
    <div
      className={`flex size-5 items-center justify-center rounded-sm ${getColorClasses(status)}`}
    >
      {status === 'completed' && (
        <CheckIcon className="size-4 stroke-white stroke-3" />
      )}
    </div>
  )
}
