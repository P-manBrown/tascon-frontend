import { useCallback, useEffect, useState } from 'react'

type Params = { targetRef: React.RefObject<HTMLElement | null> }

export function useTextSelection({ targetRef }: Params) {
  const [isTextSelected, setIsTextSelected] = useState(false)

  const handleSelectionChange = useCallback(() => {
    const target = targetRef.current
    const selection = document.getSelection()

    if (target && selection) {
      if (selection.containsNode(target, true) && !selection.isCollapsed) {
        setIsTextSelected(true)
      } else {
        setIsTextSelected(false)
      }
    }
  }, [targetRef])

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange)

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [handleSelectionChange])

  return { isTextSelected }
}
