'use client'

import { ClockIcon } from '@heroicons/react/24/outline'
import { CalendarDateRangeIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { generateFromUrlParam } from '@/utils/login-path/generate-from-url-param'
import { checkShouldShowSingleDate } from './date-utils'
import {
  formatStartDateTime,
  formatEndDateTime,
  formatMinutesToHoursAndMinutes,
} from './format-utils'
import { TaskStatusButton } from './task-status-box'
import { TaskStatusSquare } from './task-status-box/status-square'

type Props = {
  id: number
  name: string
  startsAt?: string
  endsAt?: string
  estimatedMinutes?: number
  timeSpent?: number
  note?: string
  status: 'not_started' | 'in_progress' | 'completed'
  isReadonly?: boolean
  children?: React.ReactNode
}

export function TaskCard({
  id,
  name,
  startsAt,
  endsAt,
  estimatedMinutes,
  timeSpent,
  note,
  status,
  isReadonly = false,
  children,
}: Props) {
  const pathname = usePathname()
  const params = useSearchParams()
  const fromUrl = generateFromUrlParam(pathname, params.toString())
  const isOverdue = endsAt ? new Date(endsAt) < new Date() : false
  const taskId = id.toString()

  const shouldShowSingleDate = checkShouldShowSingleDate(startsAt, endsAt)

  return (
    <div className="relative transform rounded-md border border-gray-300 bg-white p-6 drop-shadow-sm transition-all duration-200 hover:scale-103 hover:drop-shadow-lg">
      <div className={`${status === 'completed' ? 'opacity-80' : ''}`}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className={!isReadonly ? 'z-10' : ''}>
              {isReadonly ? (
                <TaskStatusSquare status={status} />
              ) : (
                <TaskStatusButton
                  taskId={taskId}
                  taskName={name}
                  status={status}
                />
              )}
            </div>
            <h2
              className={`truncate text-lg font-bold ${status === 'completed' ? 'text-gray-600 line-through' : ''}`}
            >
              {name}
            </h2>
          </div>
          {note && (
            <p className="line-clamp-3 text-sm wrap-break-word text-gray-600">
              {note}
            </p>
          )}
          {(startsAt ?? endsAt) && (
            <div
              className={`flex flex-wrap items-center gap-1 text-xs ${isOverdue ? 'text-red-700' : 'text-gray-600'}`}
            >
              <CalendarDateRangeIcon className="size-4" />
              {shouldShowSingleDate && startsAt && endsAt ? (
                <span>{formatEndDateTime(endsAt, startsAt)}</span>
              ) : (
                <>
                  {startsAt && (
                    <span>{formatStartDateTime(startsAt, endsAt)}</span>
                  )}
                  {(startsAt || endsAt) && <span>~</span>}
                  {endsAt && <span>{formatEndDateTime(endsAt, startsAt)}</span>}
                </>
              )}
            </div>
          )}

          {(estimatedMinutes ?? timeSpent) && (
            <div className="flex flex-wrap items-center gap-1 text-xs text-gray-600">
              <ClockIcon className="size-4" />
              {estimatedMinutes && (
                <span>
                  見積: {formatMinutesToHoursAndMinutes(estimatedMinutes)}
                </span>
              )}
              {estimatedMinutes && timeSpent && <span>/</span>}
              {timeSpent && (
                <span>作業: {formatMinutesToHoursAndMinutes(timeSpent)}</span>
              )}
            </div>
          )}
        </div>
        {children}
        <Link
          href={`/tasks/detail/${taskId}?${fromUrl}`}
          className="absolute top-0 left-0 h-full w-full rounded-md"
          aria-label={`${name}の詳細画面を表示`}
        />
      </div>
    </div>
  )
}
