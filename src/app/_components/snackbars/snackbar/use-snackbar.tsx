import { usePathname } from 'next/navigation'
import { useRef, useCallback, useEffect } from 'react'
import { useSnackbarsStore } from '../use-snackbars-store'

type Params = {
  id: number
  isOpen: boolean
  actionButton: React.ReactElement | undefined
}

export function useSnackbar({ id, isOpen, actionButton }: Params) {
  const ref = useRef<HTMLDivElement>(null)
  const closeSnackbar = useSnackbarsStore((state) => state.closeSnackbar)
  const cleanupSnackbar = useSnackbarsStore((state) => state.cleanupSnackbar)
  const pathname = usePathname()
  const openedPathnameRef = useRef(pathname)

  const handleClickOutside = useCallback(
    (ev: MouseEvent) => {
      if (ev.target instanceof Node) {
        if (!ref.current?.contains(ev.target)) {
          closeSnackbar(id)
        }
      }
    },
    [closeSnackbar, id]
  )

  const handleAnimationEnd = useCallback(() => {
    if (!isOpen) {
      // @ts-expect-error
      ref.current?.hidePopover()
      cleanupSnackbar(id)
    }
  }, [isOpen, cleanupSnackbar, id])

  useEffect(() => {
    if (openedPathnameRef.current !== pathname) {
      closeSnackbar(id)
    }
  }, [pathname, closeSnackbar, id])

  useEffect(() => {
    if (isOpen) {
      // @ts-expect-error
      ref.current?.showPopover()

      const timer = setTimeout(() => {
        closeSnackbar(id)
      }, 10000)
      if (actionButton === undefined) {
        document.addEventListener('click', handleClickOutside, true)
      }
      return () => {
        clearTimeout(timer)
        if (actionButton === undefined) {
          document.removeEventListener('click', handleClickOutside, true)
        }
      }
    }
  }, [isOpen, closeSnackbar, id, handleClickOutside, actionButton])

  return { ref, handleAnimationEnd }
}
