'use client'

import { ScheduleXCalendar } from '@schedule-x/react'
import 'temporal-polyfill/global'
import '@schedule-x/theme-default/dist/index.css'
import { useTaskCalendar } from './use-task-calendar'

export function TaskCalendar() {
  const { calendar } = useTaskCalendar()

  return (
    <div className="h-full w-full [&_.sx-react-calendar-wrapper]:h-full">
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  )
}
