const origin = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN;

export function generateFromUrlParam(pathname: string, params: string | null) {
  const newParams = new URLSearchParams();

  const fromUrl = params
    ? `${origin}${pathname}?${params}`
    : `${origin}${pathname}`;

  newParams.set("from_url", fromUrl);

  return newParams.toString();
}
