import {
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar'
import type { CalendarRange } from '@/types/calendar-range'
import type {
  CalendarConfig,
  CalendarEventExternal,
} from '@schedule-x/calendar'
import type { PluginBase } from '@schedule-x/calendar'

type CreateCalendarConfigParams = {
  plugins: PluginBase<string>[]
  onEventClick: (event: CalendarEventExternal) => void
  fetchEvents: (range: CalendarRange) => Promise<CalendarEventExternal[]>
}

export function createCalendarConfig({
  plugins,
  onEventClick,
  fetchEvents,
}: CreateCalendarConfigParams): CalendarConfig {
  return {
    views: [createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    defaultView: 'month-grid',
    locale: 'ja-JP',
    timezone: 'Asia/Tokyo',
    firstDayOfWeek: 1,
    dayBoundaries: {
      start: '06:00',
      end: '24:00',
    },
    weekOptions: {
      gridHeight: 1000,
    },
    plugins,
    callbacks: {
      onEventClick,
      fetchEvents,
    },
  }
}
