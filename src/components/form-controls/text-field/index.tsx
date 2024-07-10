import { forwardRef } from 'react'
import { ValidationErrorMessage } from '../validation-error-message'
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'

type Props = Omit<React.ComponentPropsWithRef<'input'>, 'type'> & {
  type: 'text' | 'email' | 'password'
  register: UseFormRegisterReturn
  suffixIcon?: React.ReactElement
  errors: FieldError | undefined
}

export const TextField = forwardRef<HTMLInputElement, Props>(function TextField(
  { register, errors, suffixIcon, ...rest },
  ref
) {
  const { ref: registerRef, ...registerRest } = register

  return (
    <div>
      <div className="relative">
        <input
          ref={(node) => {
            registerRef(node)
            if (ref && typeof ref === 'object') {
              ref.current = node
            }
          }}
          className={`text-box [&::-ms-reveal]:hidden ${
            errors ? 'text-box-error' : ''
          } ${suffixIcon ? 'pr-9' : ''}`}
          {...registerRest}
          {...rest}
        />
        {suffixIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
            {suffixIcon}
          </div>
        )}
      </div>
      {errors && (
        <ValidationErrorMessage>{errors.message}</ValidationErrorMessage>
      )}
    </div>
  )
})
