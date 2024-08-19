'use client'

import { XMarkIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { IconButton } from '@/components/buttons/icon-button'
import { ModalContent } from '@/components/contents/modal-content'
import { Modal } from '@/components/modal'
import { useModal } from '@/components/modal/use-modal'

// TEMP: https://github.com/vercel/next.js/issues/58123
// TEMP: https://github.com/vercel/next.js/issues/59316

type Props = Pick<React.ComponentProps<typeof ModalContent>, 'children'>

export function AccountModal({ children }: Props) {
  const shouldTriggerPopstate = useRef(true)
  const isBackdropMouseDown = useRef(false)
  const router = useRouter()
  const shouldCloseModal = useRef(true)
  const { isOpen, closeModal, handleAnimationEnd, handleCancel } = useModal({
    initialIsOpen: true,
  })

  const handleBackdropMouseDown = () => {
    isBackdropMouseDown.current = true
    if (!shouldTriggerPopstate.current) {
      shouldTriggerPopstate.current = true
    }
  }

  const handleBackdropClick = () => {
    if (shouldCloseModal.current) {
      closeModal()
    } else {
      shouldCloseModal.current = true
    }
  }

  const handleMouseDownCapture = () => {
    if (!shouldTriggerPopstate.current) {
      shouldTriggerPopstate.current = true
    }
  }

  const handleBlurCapture = (ev: React.FocusEvent<HTMLDivElement>) => {
    const blurredElementTag = ev.target.tagName
    const isEditorBlurred = ['INPUT', 'TEXTAREA'].includes(blurredElementTag)

    if (isEditorBlurred && isBackdropMouseDown.current) {
      shouldCloseModal.current = false
      if (isBackdropMouseDown.current) {
        isBackdropMouseDown.current = false
      }
    }
  }

  const handleClickCapture = (ev: React.MouseEvent<HTMLDivElement>) => {
    if (ev.target instanceof HTMLElement) {
      const clickedElementId = ev.target.id
      const buttonIds = ['confirm-delete-account-button', 'logout-button']

      if (buttonIds.some((id) => clickedElementId.endsWith(id))) {
        shouldTriggerPopstate.current = false
      } else {
        if (!shouldTriggerPopstate.current) {
          shouldTriggerPopstate.current = true
        }
      }
    }
  }

  // Trigger 'popstate' on unmount to address premature unmounting.
  useEffect(() => {
    return () => {
      // Avoid 'popstate' on a screen transition button click.
      if (shouldTriggerPopstate.current) {
        const popstateEvent = new PopStateEvent('popstate')
        window.dispatchEvent(popstateEvent)
      }
    }
  }, [])

  return (
    <Modal
      isOpen={isOpen}
      onAnimationEnd={handleAnimationEnd}
      onCancel={handleCancel}
      onClose={router.back}
      onBackdropMouseDown={handleBackdropMouseDown}
      onBackdropClick={handleBackdropClick}
    >
      <div
        onMouseDownCapture={handleMouseDownCapture}
        onBlurCapture={handleBlurCapture}
        onClickCapture={handleClickCapture}
      >
        <ModalContent
          upperLeftIcon={
            <IconButton
              type="button"
              tabIndex={0}
              aria-label="モーダルを閉じる"
              onClick={closeModal}
            >
              <XMarkIcon className="size-6" />
            </IconButton>
          }
        >
          {children}
        </ModalContent>
      </div>
    </Modal>
  )
}
