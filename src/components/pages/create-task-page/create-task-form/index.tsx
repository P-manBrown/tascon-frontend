'use client'

import { Button } from '@/components/buttons/button'
import { Label } from '@/components/form-controls/label'
import { TextArea } from '@/components/form-controls/text-area'
import { TextField } from '@/components/form-controls/text-field'
import { ValidationErrorMessage } from '@/components/form-controls/validation-error-message'
import { useCreateTaskForm } from './use-create-task-form'

type TaskGroup = {
  id: number
  name: string
  icon: string
}

type Props = {
  currentUserId: string
  taskGroups: TaskGroup[]
  defaultTaskGroupId?: number
}

export function CreateTaskForm({
  currentUserId,
  taskGroups,
  defaultTaskGroupId,
}: Props) {
  const {
    id,
    register,
    handleSubmit,
    errors,
    onSubmit,
    isPending,
    noteEditorRef,
    shadowRef,
    wordCount,
    handleNoteInput,
  } = useCreateTaskForm({
    currentUserId,
    defaultTaskGroupId,
  })

  return (
    <form noValidate={true} onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor={`${id}-taskGroupId`}>タスクグループ</Label>
        <select
          id={`${id}-taskGroupId`}
          disabled={isPending}
          className={`text-box ${errors.taskGroupId === undefined ? '' : 'text-box-error'}`}
          {...register('taskGroupId')}
        >
          <option value="">選択してください</option>
          {taskGroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
        {errors.taskGroupId && (
          <ValidationErrorMessage>
            {errors.taskGroupId.message}
          </ValidationErrorMessage>
        )}
      </div>
      <div className="mt-4">
        <Label htmlFor={`${id}-name`}>タスク名</Label>
        <TextField
          id={`${id}-name`}
          type="text"
          readOnly={isPending}
          register={register('name')}
          errors={errors.name}
        />
      </div>
      <div className="mt-4">
        <Label htmlFor={`${id}-startsAtDate`}>開始日（任意）</Label>
        <div className="flex items-baseline gap-2">
          <input
            id={`${id}-startsAtDate`}
            type="date"
            readOnly={isPending}
            className="text-box w-fit"
            aria-label="開始日の日付"
            {...register('duration.startsAt.startsAtDate')}
          />
          <input
            id={`${id}-startsAtTime`}
            type="time"
            readOnly={isPending}
            className="text-box w-fit"
            aria-label="開始日の時間"
            {...register('duration.startsAt.startsAtTime')}
          />
        </div>
      </div>
      <div className="mt-4">
        <Label htmlFor={`${id}-endsAtDate`}>期日（任意）</Label>
        <div className="flex items-baseline gap-2">
          <input
            id={`${id}-endsAtDate`}
            type="date"
            readOnly={isPending}
            className={`text-box w-fit ${errors.duration?.endsAt === undefined ? '' : 'text-box-error'}`}
            aria-label="期日の日付"
            {...register('duration.endsAt.endsAtDate')}
          />
          <input
            id={`${id}-endsAtTime`}
            type="time"
            readOnly={isPending}
            className={`text-box w-fit ${errors.duration?.endsAt === undefined ? '' : 'text-box-error'}`}
            aria-label="期日の時間"
            {...register('duration.endsAt.endsAtTime')}
          />
        </div>
        {errors.duration?.endsAt !== undefined && (
          <ValidationErrorMessage>
            {errors.duration.endsAt.message}
          </ValidationErrorMessage>
        )}
      </div>
      <div className="mt-4">
        <Label htmlFor={`${id}-estimatedHours`}>見積もり（任意）</Label>
        <div>
          <div className="flex items-baseline gap-2">
            <div className="flex items-center gap-1">
              <input
                id={`${id}-estimatedHours`}
                type="number"
                className={`text-box w-20 ${errors.estimatedTime?.estimatedHours === undefined ? '' : 'text-box-error'}`}
                min={0}
                readOnly={isPending}
                aria-label="見積もりの時間"
                {...register('estimatedTime.estimatedHours')}
              />
              <span>時間</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                id={`${id}-estimatedMinutes`}
                type="number"
                className={`text-box w-20 ${errors.estimatedTime?.estimatedMinutes !== undefined ? 'text-box-error' : ''}`}
                min={0}
                max={59}
                step={15}
                readOnly={isPending}
                aria-label="見積もりの分"
                {...register('estimatedTime.estimatedMinutes')}
              />
              <span>分</span>
            </div>
          </div>
          {errors.estimatedTime?.estimatedHours !== undefined && (
            <ValidationErrorMessage>
              {errors.estimatedTime.estimatedHours.message}
            </ValidationErrorMessage>
          )}
          {errors.estimatedTime?.estimatedMinutes !== undefined && (
            <ValidationErrorMessage>
              {errors.estimatedTime.estimatedMinutes.message}
            </ValidationErrorMessage>
          )}
        </div>
      </div>
      <div className="mt-4">
        <Label htmlFor={`${id}-note`}>メモ（任意）</Label>
        <TextArea
          id={`${id}-note`}
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
        作成
      </Button>
    </form>
  )
}
