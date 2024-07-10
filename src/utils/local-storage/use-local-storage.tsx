import { useState, useCallback } from 'react'

export function useLocalStorage() {
  const [hasLocalStorageValue, setHasLocalStorageValue] = useState(false)

  const saveToLocalStorage = useCallback((key: string, value: string) => {
    try {
      localStorage.setItem(key, value)
      setHasLocalStorageValue(true)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        return
      }

      throw err
    }
  }, [])

  const getLocalStorageValue = useCallback((key: string) => {
    const localStorageValue = localStorage.getItem(key)
    if (localStorageValue !== null) {
      setHasLocalStorageValue(true)
    }
    return localStorageValue
  }, [])

  const removeLocalStorageValue = useCallback((key: string) => {
    localStorage.removeItem(key)
    setHasLocalStorageValue(false)
  }, [])

  return {
    hasLocalStorageValue,
    saveToLocalStorage,
    getLocalStorageValue,
    removeLocalStorageValue,
  }
}
