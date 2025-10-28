import { useCallback, useEffect, useRef } from 'react'
import { useModal } from '@/components/modal/use-modal'

type Params = {
  initialIsOpen?: boolean
  skipPopstateButtonIds?: string[]
}

export function useFormModal({
  initialIsOpen = true,
  skipPopstateButtonIds = [],
}: Params = {}) {
  const {
    isOpen,
    shouldMount,
    openModal,
    closeModal,
    unmountModal,
    handleAnimationEnd,
    handleCancel,
  } = useModal({
    initialIsOpen,
  })

  const shouldTriggerPopstate = useRef(true)
  const isBackdropMouseDown = useRef(false)
  const shouldCloseModal = useRef(true)

  const handleBackdropMouseDown = useCallback(() => {
    isBackdropMouseDown.current = true
    if (!shouldTriggerPopstate.current) {
      shouldTriggerPopstate.current = true
    }
  }, [])

  const handleBackdropClick = useCallback(() => {
    if (shouldCloseModal.current) {
      closeModal()
    } else {
      shouldCloseModal.current = true
    }
  }, [closeModal])

  const handleMouseDownCapture = useCallback(() => {
    if (!shouldTriggerPopstate.current) {
      shouldTriggerPopstate.current = true
    }
  }, [])

  const handleBlurCapture = useCallback(
    (ev: React.FocusEvent<HTMLDivElement>) => {
      const blurredElementTag = ev.target.tagName
      const isFormFieldBlurred = ['INPUT', 'TEXTAREA'].includes(
        blurredElementTag,
      )

      if (isFormFieldBlurred && isBackdropMouseDown.current) {
        shouldCloseModal.current = false
        if (isBackdropMouseDown.current) {
          isBackdropMouseDown.current = false
        }
      }
    },
    [],
  )

  const handleClickCapture = useCallback(
    (ev: React.MouseEvent<HTMLDivElement>) => {
      if (ev.target instanceof HTMLElement) {
        const clickedElementId = ev.target.id

        if (skipPopstateButtonIds.some((id) => clickedElementId.endsWith(id))) {
          shouldTriggerPopstate.current = false
        } else {
          if (!shouldTriggerPopstate.current) {
            // Exclude navigation other than back/forward
            shouldTriggerPopstate.current = true
          }
        }
      }
    },
    [skipPopstateButtonIds],
  )

  useEffect(() => {
    return () => {
      if (shouldTriggerPopstate.current) {
        const popstateEvent = new PopStateEvent('popstate')
        window.dispatchEvent(popstateEvent)
      }
    }
  }, [])

  return {
    isOpen,
    shouldMount,
    openModal,
    closeModal,
    unmountModal,
    handleAnimationEnd,
    handleCancel,
    handleBackdropMouseDown,
    handleBackdropClick,
    handleMouseDownCapture,
    handleBlurCapture,
    handleClickCapture,
  }
}
