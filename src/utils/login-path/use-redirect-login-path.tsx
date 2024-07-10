import { useSearchParams, usePathname } from 'next/navigation'
import { generateFromUrlParam } from './generate-from-url-param'

export function useRedirectLoginPath() {
  const searchParams = useSearchParams()

  const pathname = usePathname()
  const params = searchParams.toString()

  const fromUrl = generateFromUrlParam(pathname, params)
  return `/login?${fromUrl}`
}
