'use client'

import { XCircleIcon } from '@heroicons/react/24/outline'
import { IconButton } from '@/components/buttons/icon-button'
import { ValidationErrorMessage } from '@/components/form-controls/validation-error-message'
import { useAvatarEditor } from './use-avatar-editor'

type Props = {
  avatarUrl?: string
  children: React.ReactElement
}

export function AvatarEditor({ avatarUrl, children }: Props) {
  const {
    handleSubmit,
    onSubmit,
    handleXMarkClick,
    ref,
    isPending,
    errors,
    inputRef,
    isDeleting,
    registerRest,
  } = useAvatarEditor()

  return (
    <div className="flex w-fit flex-col items-center">
      <div className="relative flex">
        <button
          type="button"
          className={`peer clickable-avatar disabled:cursor-wait disabled:hover:brightness-100 ${
            isPending ? 'disabled:animate-pulse' : ''
          }`}
          disabled={isSubmitting || isDeleting}
          tabIndex={0}
          aria-label="アバター変更"
          onClick={() => inputRef.current?.click()}
        >
          {children}
        </button>
        {avatarUrl && !isPending && (
          <IconButton
            type="button"
            className={`absolute top-0.5 right-0.5 z-10 duration-[1ms] peer-hover:visible hover:visible [@media(hover:hover)]:peer-focus-visible:visible [@media(hover:hover)]:focus-visible:visible ${
              isDeleting ? '' : '[@media(hover:hover)]:invisible'
            }`}
            aria-label="アバター削除"
            status={isDeleting ? 'pending' : 'idle'}
            onClick={handleXMarkClick}
          >
            <XCircleIcon className="size-6 fill-black stroke-white" />
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
