import { forwardRef } from 'react'
import { ValidationErrorMessage } from '../validation-error-message'
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form'

type Props = Omit<
  React.ComponentPropsWithRef<'textarea'>,
  'className' | 'style'
> & {
  wordCount?: number
  maxCount?: number
  register: UseFormRegisterReturn
  errors: FieldError | undefined
  shadowRef?: React.RefObject<HTMLTextAreaElement>
}

export const TextArea = forwardRef<HTMLTextAreaElement, Props>(
  function TextArea(
    { rows, cols, wordCount, maxCount, register, errors, shadowRef, ...rest },
    ref
  ) {
    const { ref: registerRef, ...registerRest } = register
    const textAreaClasses = `text-box overflow-hidden py-2.5 ${
      errors ? 'text-box-error' : ''
    } ${shadowRef ? 'resize-none' : ''}`

    return (
      <div className={shadowRef ? 'relative' : ''}>
        <textarea
          ref={(node) => {
            registerRef(node)
            if (ref && typeof ref === 'object') {
              ref.current = node
            }
          }}
          rows={rows}
          cols={cols}
          className={textAreaClasses}
          {...registerRest}
          {...rest}
        />
        {shadowRef && (
          <textarea
            ref={shadowRef}
            rows={rows}
            cols={cols}
            className={`${textAreaClasses} invisible absolute left-0 top-0`}
            tabIndex={-1}
            readOnly={true}
            aria-hidden={true}
          />
        )}
        <div className="flex items-center justify-between">
          <div className="flex-grow-0">
            {errors && (
              <ValidationErrorMessage>{errors.message}</ValidationErrorMessage>
            )}
          </div>
          {typeof wordCount === 'number' && (
            <p
              className={`px-1 text-sm font-semibold ${
                maxCount && maxCount < wordCount ? 'text-rose-600' : ''
              }`}
            >
              文字数：{wordCount}
              {maxCount && ` / ${maxCount}`}
            </p>
          )}
        </div>
      </div>
    )
  }
)
