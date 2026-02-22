export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins}分`
  } else if (mins === 0) {
    return `${hours}時間`
  } else {
    return `${hours}時間${mins}分`
  }
}
