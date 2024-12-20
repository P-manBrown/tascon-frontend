'use client'

import camelcaseKeys from 'camelcase-keys'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { logger } from '@/lib/pino/logger'
import { authSchema } from '@/schemas/response/auth'
import { createErrorObject } from '@/utils/error/create-error-object'
import { getPostLoginUrl } from '@/utils/url/get-post-login-url'
import { validateData } from '@/utils/validation/validate-data'
import { storeCredentials } from './store-credentials.action'
import type { CamelCaseKeys } from 'camelcase-keys'

type Params = {
  fromUrl: string | undefined
}

const messageSchema = z.object({
  request_id: z.string(),
  data: z.unknown(),
})
const successDataSchema = authSchema.omit({ avatar_url: true }).extend({
  auth_token: z.string(),
  bearer_token: z.string(),
  client_id: z.string(),
  config: z.string().nullable(),
  expiry: z.number(),
  message: z.literal('deliverCredentials'),
})
const failureDataSchema = z.object({
  message: z.literal('authFailure'),
  error: z.string().nullable(),
})
const dataSchema = z.union([successDataSchema, failureDataSchema])

type Message = CamelCaseKeys<z.infer<typeof messageSchema>, false>
type HandleSuccessfulAuthParams = {
  requestId: Message['requestId']
  data: CamelCaseKeys<z.infer<typeof successDataSchema>, false>
}
type HandleAuthFailureParams = {
  requestId: Message['requestId']
  data: CamelCaseKeys<z.infer<typeof failureDataSchema>, false>
}

const windowName = 'socialLoginWindow'

export const useSocialLoginForms = ({ fromUrl }: Params) => {
  const pathname = usePathname()
  const authActionText = pathname === '/sign-up' ? '新規登録' : 'ログイン'
  const openSnackbar = useSnackbarsStore((state) => state.openSnackbar)
  const { openErrorSnackbar } = useErrorSnackbar()
  const [activeProvider, setActiveProvider] = useState('')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const validateMessage = useCallback(
    (ev: MessageEvent<unknown>) => {
      if (ev.origin !== process.env.NEXT_PUBLIC_API_ORIGIN) {
        return null
      }
      const validateMessageResult = validateData({
        requestId: 'unknown',
        data: ev.data,
        dataSchema: messageSchema,
      })
      if (validateMessageResult instanceof Error) {
        const errorObject = createErrorObject(validateMessageResult)
        openErrorSnackbar(errorObject)
        return null
      }
      return camelcaseKeys(validateMessageResult, { deep: false })
    },
    [openErrorSnackbar],
  )

  const validateMessageData = useCallback(
    ({ requestId, data }: Message) => {
      const validateDataResult = validateData({
        requestId,
        data,
        dataSchema,
      })
      if (validateDataResult instanceof Error) {
        const errorObject = createErrorObject(validateDataResult)
        openErrorSnackbar(errorObject)
        return null
      }
      return camelcaseKeys(validateDataResult, { deep: false })
    },
    [openErrorSnackbar],
  )

  const handleAuthFailure = useCallback(
    ({ requestId, data }: HandleAuthFailureParams) => {
      logger.error({ requestId, data }, 'Social login failed')
      openSnackbar({
        severity: 'error',
        message:
          data.error === null
            ? '認証できませんでした。別のアカウントでお試しください。'
            : '認証できませんでした。再度お試しください。',
      })
    },
    [openSnackbar],
  )

  const handleSuccessfulAuth = useCallback(
    async ({ requestId, data }: HandleSuccessfulAuthParams) => {
      setActiveProvider(data.provider)

      const result = await storeCredentials({
        requestId,
        bearerToken: data.bearerToken,
        expiry: data.expiry,
      })
      if (result.status === 'error') {
        openErrorSnackbar(result)
      } else {
        const targetUrl = getPostLoginUrl(fromUrl)
        // Using router.push() causes the page displaying the modal to become Not Found.
        location.assign(targetUrl)
      }

      setActiveProvider('')
    },
    [openErrorSnackbar, fromUrl],
  )

  const handleMessage = useCallback(
    async (ev: MessageEvent<unknown>) => {
      const message = validateMessage(ev)
      if (message === null) {
        return
      }

      const data = validateMessageData({
        requestId: message.requestId,
        data: message.data,
      })
      if (data === null) {
        return
      }

      if (data.message === 'authFailure') {
        handleAuthFailure({
          requestId: message.requestId,
          data,
        })
        return
      }

      await handleSuccessfulAuth({
        requestId: message.requestId,
        data,
      })
    },
    [
      validateMessage,
      validateMessageData,
      handleAuthFailure,
      handleSuccessfulAuth,
    ],
  )

  const handleClick = useCallback((ev: React.MouseEvent<HTMLButtonElement>) => {
    const socialLoginWindow = window.open('about:blank', windowName)
    ev.currentTarget.form?.requestSubmit()
    if (socialLoginWindow !== null) {
      socialLoginWindow.opener = null
      intervalRef.current = setInterval(() => {
        socialLoginWindow?.postMessage(
          'requestCredentials',
          `${process.env.NEXT_PUBLIC_API_ORIGIN}`,
        )
        if (socialLoginWindow?.closed) {
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
        }
      }, 1000)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [handleMessage])

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  return {
    activeProvider,
    authActionText,
    handleClick,
    windowName,
  }
}
