import 'server-only'
import { headers } from 'next/headers'
import { generateFromUrlParam } from './generate-from-url-param'

export function generateRedirectLoginPath() {
  const pathname = headers().get('Tascon-Pathname') ?? '/tasks'
  const params = headers().get('Tascon-Params') ?? ''

  const fromUrl = generateFromUrlParam(pathname, params)
  return `/login?${fromUrl}`
}
