import { InboxIcon } from '@heroicons/react/24/outline'

type Props = {
  description: string
}

export function EmptyList({ description }: Props) {
  return (
    <div>
      <div className="mx-auto mb-4 flex size-24 items-center justify-center rounded-full bg-gray-100">
        <InboxIcon className="size-12 stroke-gray-600" />
      </div>
      <p className="text-center text-gray-500">{description}</p>
    </div>
  )
}
