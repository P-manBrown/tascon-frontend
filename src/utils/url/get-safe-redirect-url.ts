const origin = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN

export function getSafeRedirectUrl(
  fromUrl: string | null,
  defaultUrl: string,
): string {
  if (fromUrl && URL.canParse(fromUrl)) {
    const fromOrigin = new URL(fromUrl).origin
    if (fromOrigin === origin) {
      return fromUrl
    }
  }

  return defaultUrl
}
