const origin = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN

export function getPostLoginUrl(fromUrl: string | null | undefined) {
  let targetUrl = `${origin}/tasks`

  if (fromUrl && URL.canParse(fromUrl)) {
    const fromOrigin = new URL(fromUrl).origin
    if (fromOrigin === origin) {
      targetUrl = fromUrl
    }
  }

  return targetUrl
}
