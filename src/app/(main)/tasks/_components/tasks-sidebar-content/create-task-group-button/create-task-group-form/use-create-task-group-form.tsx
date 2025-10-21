import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback, useId, useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { useTextArea } from '@/components/form-controls/text-area/use-text-area'
import { countCharacters } from '@/utils/string-count/count-characters'
import { createTaskGroup } from './create-task-group.api'
import type { EmojiClickData } from 'emoji-picker-react'
import type { SubmitHandler } from 'react-hook-form'

const taskGroupSchema = z.object({
  icon: z.string().min(1, 'アイコンを入力してください。'),
  name: z
    .string()
    .trim()
    .min(1, 'グループ名を入力してください。')
    .refine((value) => countCharacters(value) <= 255, {
      message: '255文字以下で入力してください。',
    }),
  note: z
    .string()
    .trim()
    .refine((value) => countCharacters(value) <= 1000, {
      message: '最大文字数を超えています。',
    })
    .optional(),
})

type CreateTaskGroupFormValues = z.infer<typeof taskGroupSchema>

type Params = {
  handleSubmitSuccess?: () => void
}

export function useCreateTaskGroupForm({ handleSubmitSuccess }: Params) {
  const popoverId = useId()
  const popoverRef = useRef<HTMLDivElement>(null)
  const noteEditorRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [shouldPickerMount, setShouldPickerMount] = useState(false)
  const { openErrorSnackbar } = useErrorSnackbar()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateTaskGroupFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(taskGroupSchema),
  })

  const { shadowRef, wordCount, adjustHeight, updateWordCount } = useTextArea({
    countGranularity: 'character',
  })

  const handleNoteInput = useCallback(
    (ev: React.FormEvent<HTMLTextAreaElement>) => {
      adjustHeight(ev.currentTarget)
      updateWordCount(ev.currentTarget.value)
    },
    [adjustHeight, updateWordCount],
  )

  const handleButtonClick = useCallback(() => {
    if (!shouldPickerMount) {
      setShouldPickerMount(true)
    }
  }, [shouldPickerMount])

  const handleEmojiClick = useCallback(
    (emojiData: EmojiClickData) => {
      setValue('icon', emojiData.unified, { shouldValidate: true })
      popoverRef.current?.hidePopover()
    },
    [setValue],
  )

  const onSubmit: SubmitHandler<CreateTaskGroupFormValues> = useCallback(
    (data) => {
      startTransition(async () => {
        const result = await createTaskGroup(data)
        if (result.status === 'error') {
          openErrorSnackbar(result)
        } else {
          handleSubmitSuccess?.()
          reset()
          if (noteEditorRef.current) {
            adjustHeight(noteEditorRef.current)
            updateWordCount(noteEditorRef.current.value)
          }
          router.push(`/tasks/groups/${result.taskGroup.id}`)
        }
      })
    },
    [
      reset,
      openErrorSnackbar,
      adjustHeight,
      updateWordCount,
      handleSubmitSuccess,
      router,
    ],
  )

  return {
    popoverId,
    popoverRef,
    register,
    handleSubmit,
    watch,
    errors,
    onSubmit,
    isPending,
    noteEditorRef,
    shadowRef,
    wordCount,
    handleNoteInput,
    handleButtonClick,
    handleEmojiClick,
    shouldPickerMount,
  }
}
