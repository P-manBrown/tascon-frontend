import { useCallback, useLayoutEffect } from 'react'
import { setCursorToEnd } from '../form-controls/text-area/set-cursor-to-end'
import { useTextArea } from '../form-controls/text-area/use-text-area'

type Params = {
  editorRef: React.RefObject<HTMLTextAreaElement | null>
  isEditorOpen: boolean
}

export function useEditableMultiLineText({ editorRef, isEditorOpen }: Params) {
  const { shadowRef, adjustHeight, wordCount, updateWordCount } = useTextArea({
    countGranularity: 'character',
  })

  const handleInput = useCallback(
    (ev: React.FormEvent<HTMLTextAreaElement>) => {
      adjustHeight(ev.currentTarget)
      updateWordCount(ev.currentTarget.value)
    },
    [adjustHeight, updateWordCount],
  )

  useLayoutEffect(() => {
    if (isEditorOpen && editorRef.current) {
      adjustHeight(editorRef.current)
      setCursorToEnd(editorRef.current)
      updateWordCount(editorRef.current.value)
    }
  }, [editorRef, isEditorOpen, adjustHeight, updateWordCount])

  return { shadowRef, wordCount, handleInput }
}
