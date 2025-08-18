import camelcaseKeys from 'camelcase-keys'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { ErrorObject } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { isValidValue } from '@/utils/type-guard/is-valid-value'
import { createContact } from './create-contact.api'

type Params = {
  currentUserId: string
  contactUserId: string
}

const snackbarErrorsSchema = z.object({
  errors: z.array(
    z.object({
      full_message: z.string(),
    }),
  ),
})

export function useRegisterContactButton({
  currentUserId,
  contactUserId,
}: Params) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const redirectLoginPath = useRedirectLoginPath({ searchParams })
  const { openErrorSnackbar } = useErrorSnackbar()

  const handleHttpError = useCallback(
    (err: ErrorObject<HttpError>) => {
      const { statusCode } = err
      if (statusCode === 401) {
        router.push(redirectLoginPath)
      } else {
        const { data } = err
        if (isValidValue(snackbarErrorsSchema, data)) {
          const camelcaseError = camelcaseKeys(data.errors[0])
          openErrorSnackbar(err, camelcaseError.fullMessage)
        }
      }
    },
    [router, redirectLoginPath, openErrorSnackbar],
  )

  const handleClick = useCallback(() => {
    startTransition(async () => {
      const result = await createContact({ currentUserId, contactUserId })
      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result)
        } else {
          openErrorSnackbar(result)
        }
      }
    })
  }, [currentUserId, contactUserId, handleHttpError, openErrorSnackbar])

  return {
    isPending,
    handleClick,
  }
}
