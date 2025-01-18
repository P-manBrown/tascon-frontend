import DefaultAvatar from 'boring-avatars'
import Image from 'next/image'
import { getImagePlaceholderUrl } from '@/utils/image-placeholder/get-image-placeholder-url'

type Props = {
  size: number
  name: string
  avatarUrl: string | null
  priority?: boolean
}

const shapeClasses = 'rounded-full'

export function Avatar({ size, name, avatarUrl, priority = false }: Props) {
  return avatarUrl == null ? (
    <span className="bg-gray-300">
      <DefaultAvatar
        size={size}
        name={name}
        variant="pixel"
        colors={['#5e8747', '#c75b5e', '#486690', '#c54c3d', '#b88330']}
      />
    </span>
  ) : (
    <Image
      src={avatarUrl}
      alt={name}
      height={size}
      width={size}
      className={`aspect-square bg-white object-cover ${shapeClasses}`}
      priority={priority}
      placeholder={getImagePlaceholderUrl(size, size)}
    />
  )
}

export function LoadingAvatar({ size }: Pick<Props, 'size'>) {
  return (
    <span
      className={`skeleton block ${shapeClasses}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  )
}
