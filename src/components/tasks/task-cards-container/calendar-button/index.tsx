import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { ErrorBoundary } from 'react-error-boundary'
import { IconButton } from '@/components/buttons/icon-button'
import { CalendarError } from '@/components/calendars/calendar-error'
import { TaskCalendar } from '@/components/calendars/task-calendar'
import { ModalContent } from '@/components/contents/modal-content'
import { Modal } from '@/components/modal'
import { useModal } from '@/components/modal/use-modal'

export function CalendarButton() {
  const {
    shouldMount,
    isOpen,
    openModal,
    closeModal,
    handleAnimationEnd,
    handleCancel,
  } = useModal()

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="btn-icon absolute right-4 md:hidden"
        aria-label="カレンダーを開く"
      >
        <CalendarIcon className="size-5 stroke-2" />
      </button>
      {shouldMount && (
        <Modal
          isOpen={isOpen}
          onAnimationEnd={handleAnimationEnd}
          onCancel={handleCancel}
          onBackdropClick={handleCancel}
        >
          <ModalContent
            upperLeftIcon={
              <IconButton
                type="button"
                aria-label="モーダルを閉じる"
                onClick={closeModal}
              >
                <XMarkIcon className="size-6" />
              </IconButton>
            }
          >
            <div className="h-[calc(100vh-10rem)] w-full">
              <ErrorBoundary FallbackComponent={CalendarError}>
                <TaskCalendar />
              </ErrorBoundary>
            </div>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}
