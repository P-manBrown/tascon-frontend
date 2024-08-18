import Link from 'next/link'
import { useId } from 'react'
import { IconButton } from '@/components/buttons/icon-button'
import { Label } from '@/components/form-controls/label'
import { TextField } from '@/components/form-controls/text-field'
import { VisibilityToggleIcon } from '@/components/visibility-toggle-icon'
import { useVisibilityToggle } from '@/components/visibility-toggle-icon/use-visibility-toggle'

type Props = Pick<
  React.ComponentProps<typeof TextField>,
  'readOnly' | 'register' | 'errors'
>

export function CurrentPasswordInput(props: Props) {
  const id = useId()
  const { isVisible, toggleVisible } = useVisibilityToggle()

  return (
    <div>
      <Label htmlFor={`${id}-current-password`}>現在のパスワード</Label>
      <TextField
        id={`${id}-current-password`}
        type={isVisible ? 'text' : 'password'}
        autoComplete="current-password"
        suffixIcon={
          <IconButton
            type="button"
            aria-label={isVisible ? 'パスワードを隠す' : 'パスワードを表示する'}
            onClick={toggleVisible}
          >
            <VisibilityToggleIcon isVisible={isVisible} className="size-5" />
          </IconButton>
        }
        {...props}
      />
      <div className="mt-2 flex justify-end">
        <Link href="/password/reset" className="link">
          パスワードを忘れた場合はこちら
        </Link>
      </div>
    </div>
  )
}
