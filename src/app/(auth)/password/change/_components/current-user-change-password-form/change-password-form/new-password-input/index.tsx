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

export function NewPasswordInput(props: Props) {
  const id = useId()
  const { isVisible, toggleVisible } = useVisibilityToggle()

  return (
    <div>
      <Label htmlFor={`${id}-password`}>新しいパスワード</Label>
      <TextField
        id={`${id}-password`}
        type={isVisible ? 'text' : 'password'}
        autoComplete="new-password"
        suffixIcon={
          <IconButton
            type="button"
            aria-label={isVisible ? 'パスワードを隠す' : 'パスワードを表示する'}
            onClick={toggleVisible}
          >
            <VisibilityToggleIcon isVisible={isVisible} className="h-5 w-5" />
          </IconButton>
        }
        {...props}
      />
    </div>
  )
}
