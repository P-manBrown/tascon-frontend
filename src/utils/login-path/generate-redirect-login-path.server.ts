import 'server-only'
import { headers } from 'next/headers'
import { generateFromUrlParam } from './generate-from-url-param'

export async function generateRedirectLoginPath() {
  const headersList = await headers()
  const pathname = headersList.get('Tascon-Pathname') ?? '/tasks'
  const params = headersList.get('Tascon-Params') ?? ''

  const fromUrl = generateFromUrlParam(pathname, params)
  return `/login?${fromUrl}&err=unauthorized`
}
