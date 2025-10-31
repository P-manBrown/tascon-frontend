import { useCallback, useRef, useState } from 'react'
import { countCharacters } from '@/utils/string-count/count-characters'
import { countGraphemes } from '@/utils/string-count/count-graphemes'

type Params = {
  countGranularity: 'character' | 'grapheme'
}

export function useTextArea({ countGranularity }: Params) {
  const heightRef = useRef(0)
  const shadowRef = useRef<HTMLTextAreaElement>(null)
  const [wordCount, setWordCount] = useState(0)

  const adjustHeight = useCallback((element: HTMLTextAreaElement) => {
    const shadow = shadowRef.current
    if (shadow) {
      shadow.value = element.value
      element.style.height = `${shadow.scrollHeight}px`
      heightRef.current = element.scrollHeight
    }
  }, [])

  const updateWordCount = useCallback(
    (value: HTMLTextAreaElement['value']) => {
      const trimmedValue = value.trim()
      const countFunctions = {
        character: countCharacters,
        grapheme: countGraphemes,
      }
      const countFunction = countFunctions[countGranularity]
      const count = countFunction(trimmedValue)
      setWordCount(count)
    },
    [countGranularity],
  )

  return {
    shadowRef,
    adjustHeight,
    wordCount,
    updateWordCount,
  }
}
