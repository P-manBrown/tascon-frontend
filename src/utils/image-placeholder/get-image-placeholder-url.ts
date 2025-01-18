function skeleton(width: number, height: number) {
  return `
    <svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#d1d5db" offset="20%" />
          <stop stop-color="#f3f4f6" offset="50%" />
          <stop stop-color="#d1d5db" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="#d1d5db" />
      <rect id="r" width="${width}" height="${height}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${width}" to="${width}" dur="1s" repeatCount="indefinite" />
    </svg>`
}

function toBase64(str: string) {
  if (typeof window === 'undefined') {
    return Buffer.from(str).toString('base64')
  } else {
    return window.btoa(str)
  }
}

export function getImagePlaceholderUrl(
  width: number,
  height: number,
): `data:image/${string}` {
  return `data:image/svg+xml;base64,${toBase64(skeleton(width, height))}`
}
