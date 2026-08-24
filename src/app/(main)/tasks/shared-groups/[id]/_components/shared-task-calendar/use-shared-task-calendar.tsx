import { createEventsServicePlugin } from '@schedule-x/events-service'
import { useNextCalendarApp } from '@schedule-x/react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { CalendarRange } from '@/types/calendar-range'
import { convertTasksToEvents } from '@/utils/calendar/convert-tasks-to-events'
import { createCalendarConfig } from '@/utils/calendar/create-calendar-config'
import { HttpError } from '@/utils/error/custom/http-error'
import { generateFromUrlParam } from '@/utils/login-path/generate-from-url-param'
import { getSharedCalendarTasks } from '../get-shared-calendar-tasks.api'
import type { CalendarEventExternal } from '@schedule-x/calendar'

type Props = {
  shareId: string
}

export function useSharedTaskCalendar({ shareId }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { showBoundary } = useErrorBoundary()
  const initialPathnameRef = useRef(pathname)
  const [eventsService] = useState(() => createEventsServicePlugin())
  const currentRangeRef = useRef<CalendarRange | null>(null)

  const handleEventClick = useCallback(
    (event: CalendarEventExternal) => {
      router.push(`/tasks/shared-groups/${shareId}/task/${event.id}`)
    },
    [router, shareId],
  )

  const handleCalendarError = useCallback(
    (err: unknown) => {
      if (err instanceof HttpError && err.statusCode === 401) {
        const fromUrl = generateFromUrlParam(
          initialPathnameRef.current,
          searchParams.toString(),
        )
        router.push(`/login?${fromUrl}`)
        return
      }
      showBoundary(err)
    },
    [router, searchParams, showBoundary],
  )

  const fetchCalendarEvents = useCallback(
    async (range: CalendarRange) => {
      const startDate = range.start.toPlainDate().toString()
      const endDate = range.end.toPlainDate().toString()

      const tasks = await getSharedCalendarTasks({
        shareId,
        start: startDate,
        end: endDate,
      })

      return convertTasksToEvents(tasks)
    },
    [shareId],
  )

  const fetchEvents = useCallback(
    async (range: CalendarRange) => {
      try {
        currentRangeRef.current = range

        const events = await fetchCalendarEvents(range)

        return events
      } catch (err: unknown) {
        handleCalendarError(err)
        return []
      }
    },
    [fetchCalendarEvents, handleCalendarError],
  )

  const calendar = useNextCalendarApp(
    createCalendarConfig({
      plugins: [eventsService],
      onEventClick: handleEventClick,
      fetchEvents,
    }),
  )

  return { calendar }
}
