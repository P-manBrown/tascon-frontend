'use client'

import { XCircleIcon } from '@heroicons/react/24/outline'
import { Avatar, LoadingAvatar } from '@/components/avatars/avatar'
import { CurrentUserAvatar } from '@/components/avatars/current-user-avatar'
import { IconButton } from '@/components/buttons/icon-button'
import { ValidationErrorMessage } from '@/components/form-controls/validation-error-message'
import { useEditableAvatar } from './use-editable-avatar'

type EditableAvatarProps = Pick<
  React.ComponentProps<typeof Avatar>,
  'name' | 'size'
> & {
  initialAvatarUrl: string | null
  csrfToken: string
}

export function EditableAvatar({
  name,
  initialAvatarUrl,
  size,
  csrfToken,
}: EditableAvatarProps) {
  const {
    handleSubmit,
    onSubmit,
    handleXMarkClick,
    ref,
    isSubmitting,
    errors,
    inputRef,
    avatarUrl,
    isDeletingAvatar,
    registerRest,
  } = useEditableAvatar({ initialAvatarUrl, csrfToken })

  return (
    <div className="flex w-fit flex-col items-center">
      <div className="relative flex">
        <button
          type="button"
          className="peer btn-avatar disabled:cursor-wait"
          disabled={isSubmitting}
          tabIndex={0}
          aria-label="アバター変更"
          onClick={() => inputRef.current?.click()}
        >
          {isSubmitting ? (
            <LoadingAvatar size={size} />
          ) : (
            <CurrentUserAvatar
              size={size}
              name={name}
              avatarUrl={avatarUrl}
              priority={true}
            />
          )}
        </button>
        {avatarUrl && !isSubmitting && (
          <IconButton
            type="button"
            className={`absolute right-0.5 top-0.5 z-10 duration-[1ms] hover:visible peer-hover:visible [@media(hover:hover)]:focus-visible:visible [@media(hover:hover)]:peer-focus-visible:visible ${
              isDeletingAvatar ? '' : '[@media(hover:hover)]:invisible'
            }`}
            aria-label="アバター削除"
            status={isDeletingAvatar ? 'pending' : 'idle'}
            onClick={handleXMarkClick}
          >
            <XCircleIcon className="h-6 w-6 fill-black stroke-white" />
          </IconButton>
        )}
      </div>
      <form
        noValidate={true}
        onSubmit={handleSubmit(onSubmit)}
        onChange={(ev) => ev.currentTarget.requestSubmit()}
      >
        <input
          type="file"
          className="hidden"
          accept="image/png, image/jpeg"
          ref={(node) => {
            ref(node)
            inputRef.current = node
          }}
          {...registerRest}
        />
        {errors.avatar && (
          <ValidationErrorMessage>
            {errors.avatar.message}
          </ValidationErrorMessage>
        )}
      </form>
    </div>
  )
}
