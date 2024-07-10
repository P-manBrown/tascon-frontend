import { headers } from 'next/headers'
import { getCsrfToken } from '@/utils/cookie/get-csrf-token'
import { Button } from '../buttons/button'

const socialLoginForms = [
  {
    provider: 'google_oauth2',
    appName: 'Google',
    className: 'bg-blue-500 text-white',
  },
  { provider: 'twitter', appName: 'X', className: 'bg-black text-white' },
]
const apiBaseUrl = `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/v1/auth`
const origin = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN

export function SocialLoginForms() {
  const pathname = headers().get('Tascon-Pathname')
  const authActionText = pathname === '/sign-up' ? '新規登録' : 'ログイン'
  const params = new URLSearchParams(headers().get('Tascon-Params') ?? '')
  params.delete('err')

  const successRedirectUrl = params.get('from_url') ?? `${origin}/tasks`

  const stringParams = params.toString()
  let failureRedirectUrl = `${origin}${pathname}`
  if (stringParams) {
    failureRedirectUrl = `${origin}${pathname}?${stringParams}`
  }

  const getCsrfTokenResult = getCsrfToken()
  if (getCsrfTokenResult instanceof Error) {
    throw getCsrfTokenResult
  }
  const csrfToken = getCsrfTokenResult

  return (
    <>
      {socialLoginForms.map((form) => {
        return (
          <form
            key={form.provider}
            action={`${apiBaseUrl}/${form.provider}`}
            method="POST"
          >
            <input
              type="hidden"
              name="auth_origin_url"
              value={successRedirectUrl}
            />
            <input
              type="hidden"
              name="failure_redirect_url"
              value={failureRedirectUrl}
            />
            <input type="hidden" name="authenticity_token" value={csrfToken} />
            <Button type="submit" className={`btn-shadow ${form.className}`}>
              {`${form.appName}で${authActionText}`}
            </Button>
          </form>
        )
      })}
    </>
  )
}
