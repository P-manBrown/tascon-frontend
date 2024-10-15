import { useState, useCallback } from 'react'

type Params = {
  key: string
}

export function useLocalStorage({ key }: Params) {
  const [hasLocalStorageValue, setHasLocalStorageValue] = useState(false)

  const saveToLocalStorage = useCallback(
    (value: string) => {
      try {
        localStorage.setItem(key, value)
        setHasLocalStorageValue(true)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'QuotaExceededError') {
          return
        }

        throw err
      }
    },
    [key],
  )

  const getLocalStorageValue = useCallback(() => {
    const localStorageValue = localStorage.getItem(key)
    if (localStorageValue !== null) {
      setHasLocalStorageValue(true)
    }
    return localStorageValue
  }, [key])

  const removeLocalStorageValue = useCallback(() => {
    localStorage.removeItem(key)
    setHasLocalStorageValue(false)
  }, [key])

  return {
    hasLocalStorageValue,
    saveToLocalStorage,
    getLocalStorageValue,
    removeLocalStorageValue,
  }
}
