export function generateLocalStorageKey(currentUserId: string, key: string) {
  return `${currentUserId}_${key}`
}
