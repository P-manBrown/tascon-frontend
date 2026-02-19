import { ValidationErrorMessage } from '../validation-error-message'
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'

type Props = {
  dateId: string
  timeId: string
  dateLabel: string
  timeLabel: string
  dateRegister: UseFormRegisterReturn
  timeRegister: UseFormRegisterReturn
  dateError?: FieldError
  timeError?: FieldError
  readOnly?: boolean
  className?: string
  ref?: React.RefObject<HTMLInputElement | null>
}

export function DateTimeInput({
  dateId,
  timeId,
  dateLabel,
  timeLabel,
  dateRegister,
  timeRegister,
  dateError,
  timeError,
  readOnly = false,
  className = '',
  ref,
}: Props) {
  const { ref: dateRegisterRef, ...dateRegisterRest } = dateRegister
  const { ref: timeRegisterRef, ...timeRegisterRest } = timeRegister

  const hasError = dateError || timeError

  return (
    <div>
      <div className={`flex items-baseline gap-2 ${className}`}>
        <input
          id={dateId}
          type="date"
          readOnly={readOnly}
          className={`text-box w-fit ${hasError ? 'text-box-error' : ''}`}
          aria-label={dateLabel}
          ref={(node) => {
            dateRegisterRef(node)
            if (ref && typeof ref === 'object') {
              ref.current = node
            }
          }}
          {...dateRegisterRest}
        />
        <input
          id={timeId}
          type="time"
          readOnly={readOnly}
          className={`text-box w-fit ${hasError ? 'text-box-error' : ''}`}
          aria-label={timeLabel}
          ref={timeRegisterRef}
          {...timeRegisterRest}
        />
      </div>
      {dateError && (
        <ValidationErrorMessage>{dateError.message}</ValidationErrorMessage>
      )}
      {timeError && (
        <ValidationErrorMessage>{timeError.message}</ValidationErrorMessage>
      )}
    </div>
  )
}
