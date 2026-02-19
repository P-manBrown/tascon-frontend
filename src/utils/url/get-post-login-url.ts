import { getSafeRedirectUrl } from './get-safe-redirect-url'

export function getPostLoginUrl(fromUrl: string | null) {
  return getSafeRedirectUrl(fromUrl, '/tasks')
}
