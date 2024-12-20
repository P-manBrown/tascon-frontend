import type { SearchParams } from '@/types/page'

export function getFromUrl(searchParams: SearchParams) {
  const fromUrl = searchParams.from_url
  if (typeof fromUrl === 'string') {
    return fromUrl
  }
}
