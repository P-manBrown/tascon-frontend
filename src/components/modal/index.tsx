import { useEffect, useRef, useState } from 'react'

type Props = Omit<
  React.ComponentPropsWithoutRef<'dialog'>,
  'onCancel' | 'onAnimationEnd' | 'onClose'
> & {
  isOpen: boolean
  onCancel: (ev: React.SyntheticEvent<HTMLDialogElement, Event>) => void
  onAnimationEnd: (ev: React.AnimationEvent<HTMLDialogElement>) => void
  onClose: (ev: React.SyntheticEvent<HTMLDialogElement, Event>) => void
  onBackdropClick?: (ev: React.MouseEvent<HTMLDialogElement>) => void
  onBackdropMouseDown?: (ev: React.MouseEvent<HTMLDialogElement>) => void
}

export function Modal({
  isOpen,
  onCancel,
  onBackdropClick,
  onBackdropMouseDown,
  children,
  ...rest
}: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const [shouldMountContent, setShouldMountContent] = useState(false)

  // Trigger onCancel when Escape is pressed without clicking the dialog.
  const handleKeyDown = (ev: React.KeyboardEvent<HTMLDialogElement>) => {
    if (ev.key === 'Escape') {
      onCancel(ev)
    }
  }

  useEffect(() => {
    const dialog = ref.current
    if (isOpen && dialog && !dialog.open) {
      dialog.showModal()
    }
  }, [isOpen])

  useEffect(() => {
    if (ref.current) {
      setShouldMountContent(ref.current.open)
    }
  }, [ref.current?.open])

  return (
    <dialog
      ref={ref}
      className={`overflow-scroll rounded-md border border-gray-200 p-0 shadow-black/30 backdrop:bg-transparent backdrop:backdrop-blur-sm max-md:inset-auto max-md:bottom-0 max-md:left-0 max-md:max-h-[95%] max-md:w-full max-md:max-w-full md:shadow-lg ${
        isOpen
          ? 'overflow- animate-slide-in-bottom md:animate-scale-in-center'
          : 'animate-slide-out-bottom md:animate-scale-out-center'
      } ${!onBackdropClick ? 'backdrop:cursor-not-allowed' : ''}`}
      onMouseDown={onBackdropMouseDown}
      onClick={onBackdropClick}
      onCancel={onCancel}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <div
        onMouseDown={(ev) => ev.stopPropagation()}
        onClick={(ev) => ev.stopPropagation()}
      >
        {shouldMountContent && children}
      </div>
    </dialog>
  )
}
