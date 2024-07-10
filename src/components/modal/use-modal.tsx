import { useCallback, useState } from 'react'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'

type Params = {
  initialIsOpen?: true | false
}

export function useModal({ initialIsOpen = false }: Params = {}) {
  const [shouldMount, setShouldMount] = useState(initialIsOpen)
  const [isOpen, setIsOpen] = useState(initialIsOpen)
  const closeAllSnackbars = useSnackbarsStore(
    (state) => state.closeAllSnackbars
  )

  const openModal = useCallback(() => {
    setShouldMount(true)
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    closeAllSnackbars()
  }, [closeAllSnackbars])

  const unmountModal = useCallback(() => {
    setShouldMount(false)
  }, [])

  const handleAnimationEnd = useCallback(
    (ev: React.AnimationEvent<HTMLDialogElement>) => {
      if (!isOpen) {
        ev.currentTarget.close()
      }
    },
    [isOpen]
  )

  const handleCancel = useCallback(
    (ev: React.SyntheticEvent<HTMLDialogElement, Event>) => {
      // Avoid closing the dialog when canceling the file selection.
      if (!(ev.target instanceof HTMLInputElement)) {
        ev.preventDefault()
        ev.stopPropagation()
        closeModal()
      }
    },
    [closeModal]
  )

  return {
    shouldMount,
    isOpen,
    openModal,
    closeModal,
    unmountModal,
    handleAnimationEnd,
    handleCancel,
  }
}
