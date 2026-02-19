import { ValidationErrorMessage } from '../validation-error-message'
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'

type Props = {
  hoursId: string
  minutesId: string
  hoursLabel: string
  minutesLabel: string
  hoursRegister: UseFormRegisterReturn
  minutesRegister: UseFormRegisterReturn
  hoursError?: FieldError
  minutesError?: FieldError
  readOnly?: boolean
  className?: string
  ref?: React.RefObject<HTMLInputElement | null>
}

export function HoursMinutesInput({
  hoursId,
  minutesId,
  hoursLabel,
  minutesLabel,
  hoursRegister,
  minutesRegister,
  hoursError,
  minutesError,
  readOnly = false,
  className = '',
  ref,
}: Props) {
  const { ref: hoursRegisterRef, ...hoursRegisterRest } = hoursRegister
  const { ref: minutesRegisterRef, ...minutesRegisterRest } = minutesRegister
  const hasError = hoursError || minutesError

  return (
    <div>
      <div className={`flex items-baseline gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          <input
            id={hoursId}
            type="number"
            readOnly={readOnly}
            className={`text-box w-20 ${hasError ? 'text-box-error' : ''}`}
            min={0}
            aria-label={hoursLabel}
            ref={(node) => {
              hoursRegisterRef(node)
              if (ref && typeof ref === 'object') {
                ref.current = node
              }
            }}
            {...hoursRegisterRest}
          />
          <span>時間</span>
        </div>
        <div className="flex items-center gap-1">
          <input
            id={minutesId}
            type="number"
            readOnly={readOnly}
            className={`text-box w-20 ${hasError ? 'text-box-error' : ''}`}
            min={0}
            max={59}
            step={15}
            aria-label={minutesLabel}
            ref={minutesRegisterRef}
            {...minutesRegisterRest}
          />
          <span>分</span>
        </div>
      </div>
      {hoursError && (
        <ValidationErrorMessage>{hoursError.message}</ValidationErrorMessage>
      )}
      {minutesError && (
        <ValidationErrorMessage>{minutesError.message}</ValidationErrorMessage>
      )}
    </div>
  )
}
