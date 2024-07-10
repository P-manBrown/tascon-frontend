const origin = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN

export function generateFromUrlParam(pathname: string, params: string | null) {
  const newParams = new URLSearchParams()

  let fromUrl
  if (params) {
    fromUrl = `${origin}${pathname}?${params}`
  } else {
    fromUrl = `${origin}${pathname}`
  }

  newParams.set('from_url', fromUrl)

  return newParams.toString()
}
