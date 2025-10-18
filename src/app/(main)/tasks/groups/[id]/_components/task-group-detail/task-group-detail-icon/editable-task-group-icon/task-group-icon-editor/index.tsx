'use client'

import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { useId, useRef, useTransition } from 'react'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { ErrorObject } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { changeTaskGroupIcon } from './change-task-group-icon.api'
import type { EmojiClickData } from 'emoji-picker-react'

const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false })

type Props = {
  taskGroupId: string
  label: React.ReactElement
  children: React.ReactElement
}

export function TaskGroupIconEditor({ taskGroupId, label, children }: Props) {
  const popoverId = useId()
  const popoverRef = useRef<HTMLDivElement>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectLoginPath = useRedirectLoginPath({ searchParams })
  const { openErrorSnackbar } = useErrorSnackbar()

  const handleHttpError = (err: ErrorObject<HttpError>) => {
    if (err.statusCode === 401) {
      router.push(redirectLoginPath)
    } else {
      openErrorSnackbar(err)
    }
  }

  const handleEmojiClick = (data: EmojiClickData) => {
    startTransition(async () => {
      popoverRef.current?.hidePopover()
      const result = await changeTaskGroupIcon({
        taskGroupId,
        bodyData: { icon: data.unified },
      })
      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result)
        } else {
          openErrorSnackbar(result)
        }
      }
    })
  }

  return (
    <div>
      <DetailItemHeadingLayout>{label}</DetailItemHeadingLayout>
      <DetailItemContentLayout>
        <button
          type="button"
          className="block duration-200 hover:brightness-75 disabled:animate-pulse disabled:cursor-not-allowed"
          popoverTarget={popoverId}
          disabled={isPending}
        >
          {children}
        </button>
      </DetailItemContentLayout>
      <div
        ref={popoverRef}
        popover="auto"
        id={popoverId}
        className="top-[anchor(top)] left-[anchor(right)] ml-1 rounded-lg drop-shadow-md"
      >
        <Picker
          onEmojiClick={handleEmojiClick}
          searchDisabled={true}
          skinTonesDisabled={true}
          previewConfig={{ showPreview: false }}
          width="100%"
        />
      </div>
    </div>
  )
}
