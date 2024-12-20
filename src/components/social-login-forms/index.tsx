'use client'

import { useSocialLoginForms } from './use-social-login-forms'
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

type Props = {
  fromUrl?: string
}

export function SocialLoginForms({ fromUrl }: Props) {
  const { activeProvider, authActionText, handleClick, windowName } =
    useSocialLoginForms({ fromUrl })

  return (
    <>
      {socialLoginForms.map((form) => (
        <form
          key={form.provider}
          target={windowName}
          action={`${apiBaseUrl}/${form.provider}`}
          method="POST"
        >
          <input type="hidden" name="omniauth_window_type" value="newWindow" />
          <Button
            type="button"
            className={`${activeProvider === form.provider ? 'btn-disabled' : `btn-shadow ${form.className}`}`}
            status={activeProvider === form.provider ? 'pending' : 'idle'}
            onClick={handleClick}
          >
            {`${form.appName}で${authActionText}`}
          </Button>
        </form>
      ))}
    </>
  )
}
