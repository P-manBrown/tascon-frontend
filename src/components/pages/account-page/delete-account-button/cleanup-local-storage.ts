import 'client-only'

export function cleanupLocalStorage(currentUserId: string) {
  const keys = Object.keys(localStorage)
  keys.forEach((key) => {
    if (key.startsWith(currentUserId)) {
      localStorage.removeItem(key)
    }
  })
}
