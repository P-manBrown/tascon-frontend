import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

type Props = {
  isVisible: boolean
  className?: string
}

export function VisibilityToggleIcon({ isVisible, ...rest }: Props) {
  return isVisible ? <EyeIcon {...rest} /> : <EyeSlashIcon {...rest} />
}
