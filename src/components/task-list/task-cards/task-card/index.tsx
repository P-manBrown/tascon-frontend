'use client'

import { ClockIcon } from '@heroicons/react/24/outline'
import { CalendarDateRangeIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

type Props = {
  id: number
  name: string
  startsAt?: string
  endsAt?: string
  estimatedMinutes?: number
  timeSpent?: number
  note?: string
  status: 'not_started' | 'in_progress' | 'completed'
  children?: React.ReactNode
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })
}

function formatMinutesToHoursAndMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}時間${remainingMinutes}分`
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
  children,
}: Props) {
  const isOverdue = endsAt ? new Date(endsAt) < new Date() : false

  return (
    <div className="relative transform rounded-md border border-gray-300 bg-white p-6 drop-shadow-sm transition-all duration-200 hover:scale-103 hover:drop-shadow-lg">
      <div className={`${status === 'completed' ? 'opacity-80' : ''}`}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={status === 'completed'}
              className="pointer-events-none size-5 rounded-md"
              aria-label={`${name}の完了状態`}
              onChange={() => {}}
            />
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
              {startsAt && <span>{formatDateTime(startsAt)}</span>}
              {startsAt && endsAt && <span>~</span>}
              {endsAt && <span>{formatDateTime(endsAt)}</span>}
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
          href={`/tasks/detail/${id}`}
          className="absolute top-0 left-0 h-full w-full rounded-md"
          aria-label={`${name}の詳細画面を表示`}
        />
      </div>
    </div>
  )
}
