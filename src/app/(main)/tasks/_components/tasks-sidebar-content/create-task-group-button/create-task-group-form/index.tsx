import dynamic from 'next/dynamic'
import { useId } from 'react'
import { Button } from '@/components/buttons/button'
import { Label } from '@/components/form-controls/label'
import { TextArea } from '@/components/form-controls/text-area'
import { TextField } from '@/components/form-controls/text-field'
import { useCreateTaskGroupForm } from './use-create-task-group-form'

const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false })

const Emoji = dynamic(
  () => import('emoji-picker-react').then((mod) => mod.Emoji),
  { ssr: false },
)

type Props = {
  handleSubmitSuccess?: () => void
}

export function CreateTaskGroupForm({ handleSubmitSuccess }: Props) {
  const popoverId = useId()

  const {
    popoverRef,
    register,
    handleSubmit,
    errors,
    onSubmit,
    isPending,
    noteEditorRef,
    shadowRef,
    wordCount,
    handleNoteInput,
    handleEmojiClick,
    watch,
  } = useCreateTaskGroupForm({ handleSubmitSuccess })

  return (
    <form noValidate={true} onSubmit={handleSubmit(onSubmit)}>
      <Label htmlFor="icon">アイコン</Label>
      <button
        type="button"
        className={`text-box size-11 ${errors.icon === undefined ? '' : 'text-box-error'}`}
        popoverTarget={popoverId}
      >
        <Emoji unified={watch('icon')} size={32} />
      </button>
      <div
        ref={popoverRef}
        popover="auto"
        id={popoverId}
        className="top-[anchor(top)] left-[anchor(right)] ml-1 rounded-lg drop-shadow-md"
      >
        <Picker
          onEmojiClick={handleEmojiClick}
          searchDisabled={true}
          skinTonesDisabled={true}
          previewConfig={{ showPreview: false }}
          width="100%"
        />
      </div>
      <TextField
        type="text"
        readOnly={true}
        register={register('icon')}
        errors={errors.icon}
        hidden={true}
      />
      <div className="mt-4">
        <Label htmlFor="name">グループ名</Label>
        <TextField
          type="text"
          readOnly={isPending}
          register={register('name')}
          errors={errors.name}
        />
      </div>
      <div className="mt-4">
        <Label htmlFor="note">メモ（任意）</Label>
        <TextArea
          ref={noteEditorRef}
          shadowRef={shadowRef}
          rows={6}
          readOnly={isPending}
          register={register('note')}
          errors={errors.note}
          wordCount={wordCount}
          maxCount={1000}
          onInput={handleNoteInput}
        />
      </div>
      <Button
        type="submit"
        className="btn-primary mt-6 min-w-24"
        status={isPending ? 'pending' : 'idle'}
      >
        追加
      </Button>
    </form>
  )
}
