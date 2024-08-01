import { useCallback, useState } from 'react'

export function useVisibilityToggle() {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisible = useCallback(() => {
    setIsVisible((prev) => !prev)
  }, [])

  return {
    isVisible,
    toggleVisible,
  }
}
