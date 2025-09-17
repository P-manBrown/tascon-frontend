'use client'

import { useTransition } from 'react'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { Button } from '@/components/buttons/button'
import { isValidValue } from '@/utils/type-guard/is-valid-value'
import { createContactFromSuggestion } from './create-contact-from-suggestion.api'
import type { ErrorObject } from '@/types/error'
import type { HttpError } from '@/utils/error/custom/http-error'

const errorObjectSchema = z.object({
  error: z.object({
    message: z.string(),
  }),
})
const errorsObjectSchema = z.object({
  errors: z.array(errorObjectSchema.shape.error),
})
const snackbarErrorSchema = z.union([errorObjectSchema, errorsObjectSchema])

type Props = {
  userId: number
  currentUserId: string
}

export function CreateContactFromSuggestionButton({
  userId,
  currentUserId,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const { openErrorSnackbar } = useErrorSnackbar()

  const handleHttpError = (err: ErrorObject<HttpError>) => {
    const { data } = err
    if (!isValidValue(snackbarErrorSchema, data)) {
      openErrorSnackbar(err)
      return
    }

    if ('error' in data) {
      openErrorSnackbar(err, data.error.message)
    } else {
      openErrorSnackbar(err, data.errors[0].message)
    }
  }

  const handleClick = () => {
    startTransition(async () => {
      const result = await createContactFromSuggestion({
        currentUserId,
        contactUserId: userId,
      })
      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result)
        } else {
          openErrorSnackbar(result)
        }
      }
    })
  }

  return (
    <Button
      status={isPending ? 'pending' : 'idle'}
      className="btn-primary"
      onClick={handleClick}
    >
      登録
    </Button>
  )
}
