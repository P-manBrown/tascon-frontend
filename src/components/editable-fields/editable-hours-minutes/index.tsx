import { TrashIcon } from '@heroicons/react/24/outline'
import { useRef } from 'react'
import { Button } from '@/components/buttons/button'
import { IconButton } from '@/components/buttons/icon-button'
import { useDragInside } from '@/components/editable-fields/use-drag-inside'
import { useEditableFieldAnimation } from '@/components/editable-fields/use-editable-field-animation'
import { useTextSelection } from '@/components/editable-fields/use-text-selection'

type Props = {
  editor: React.ReactElement
  isEditorOpen: boolean
  hasLocalStorageValue: boolean
  onFormSubmit: (ev: React.FormEvent<HTMLFormElement>) => void
  onBlur: (ev: React.FocusEvent<HTMLFormElement>) => void
  onCancelClick: () => void
  onDeleteClick?: () => void
  openEditor: () => void
  isSubmitting: boolean
  isDeleting: boolean
  showDeleteButton: boolean
  children: React.ReactElement
}

export function EditableHoursMinutes({
  editor,
  isEditorOpen,
  hasLocalStorageValue,
  onFormSubmit,
  onCancelClick,
  onDeleteClick,
  openEditor,
  isSubmitting,
  isDeleting = false,
  showDeleteButton = false,
  children,
  ...rest
}: Props) {
  const contentRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { isTextSelected } = useTextSelection({ targetRef: contentRef })
  const {
    isDraggingInside,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseUp,
  } = useDragInside()
  const { isAnimating, containerHeight } = useEditableFieldAnimation({
    containerRef,
    contentRef,
    isEditorOpen,
  })

  const handleFormKeyDown = (ev: React.KeyboardEvent<HTMLFormElement>) => {
    if (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      ev.currentTarget.requestSubmit()
    } else if (ev.key === 'Escape') {
      ev.preventDefault()
      ev.stopPropagation()
      onCancelClick()
    }
  }

  return (
    <div
      ref={containerRef}
      className="overflow-hidden"
      style={{ height: isAnimating ? `${containerHeight}px` : 'auto' }}
    >
      {isEditorOpen ? (
        <form
          className="rounded-sm bg-gray-100 p-2"
          noValidate={true}
          onSubmit={onFormSubmit}
          onKeyDown={handleFormKeyDown}
          {...rest}
        >
          <div className="flex items-start justify-between gap-2">
            {editor}
            {showDeleteButton && (
              <IconButton
                type="button"
                tabIndex={0}
                onClick={onDeleteClick}
                className="text-red-600"
                status={
                  isDeleting ? 'pending' : isSubmitting ? 'disabled' : 'idle'
                }
                aria-label="削除"
              >
                <TrashIcon className="size-5" />
              </IconButton>
            )}
          </div>
          <div className="mt-2 flex items-center px-1">
            <Button
              type="submit"
              tabIndex={0}
              className="btn-primary h-9 w-28 text-sm"
              status={
                isSubmitting ? 'pending' : isDeleting ? 'disabled' : 'idle'
              }
            >
              保存
            </Button>
            <Button
              type="button"
              tabIndex={0}
              className="btn-ghost ml-1 h-9 w-28 text-sm md:ml-2"
              onClick={onCancelClick}
            >
              {hasLocalStorageValue ? '変更を破棄' : 'キャンセル'}
            </Button>
          </div>
        </form>
      ) : (
        <div
          ref={contentRef}
          className={`relative h-fit has-[>button:last-of-type:hover]:select-none ${
            isDraggingInside ? 'hover:cursor-text' : 'hover:cursor-default'
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
        >
          {children}
          <button
            className={`absolute top-0 left-0 h-full w-full rounded-sm duration-200 has-[>span]:hover:bg-black/10 ${
              isTextSelected || isDraggingInside ? 'pointer-events-none' : ''
            }`}
            onClick={openEditor}
            aria-label="編集"
          >
            {/* Prevent flickering when hovering while dragging. */}
            {/* Ensure that CSS changes are reflected immediately. */}
            {!(isTextSelected || isDraggingInside) && <span />}
          </button>
        </div>
      )}
    </div>
  )
}
