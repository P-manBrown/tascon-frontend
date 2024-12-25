import { usePathname, ReadonlyURLSearchParams } from 'next/navigation'
import { generateFromUrlParam } from './generate-from-url-param'

type Params = {
  searchParams: ReadonlyURLSearchParams | null
}
export function useRedirectLoginPath({ searchParams }: Params) {
  const pathname = usePathname()
  const params = searchParams?.toString() ?? null

  const fromUrl = generateFromUrlParam(pathname, params)
  return `/login?${fromUrl}&err='unauthorized'`
}
