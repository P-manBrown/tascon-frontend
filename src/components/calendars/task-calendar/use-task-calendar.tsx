import type { CalendarEventExternal } from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { useNextCalendarApp } from "@schedule-x/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useErrorBoundary } from "react-error-boundary";
import type { CalendarRange } from "@/types/calendar-range";
import { convertTasksToEvents } from "@/utils/calendar/convert-tasks-to-events";
import { createCalendarConfig } from "@/utils/calendar/create-calendar-config";
import { HttpError } from "@/utils/error/custom/http-error";
import { generateFromUrlParam } from "@/utils/login-path/generate-from-url-param";
import { getCalendarTasks } from "./get-calendar-tasks.api";

export function useTaskCalendar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showBoundary } = useErrorBoundary();
  const initialPathnameRef = useRef(pathname);
  const [eventsService] = useState(() => createEventsServicePlugin());
  const currentRangeRef = useRef<CalendarRange | null>(null);

  const handleEventClick = useCallback(
    (event: CalendarEventExternal) => {
      const fromUrl = generateFromUrlParam(pathname, searchParams.toString());

      router.push(`/tasks/detail/${event.id}?${fromUrl}`);
    },
    [router, pathname, searchParams],
  );

  const handleCalendarError = useCallback(
    (err: unknown) => {
      if (err instanceof HttpError && err.statusCode === 401) {
        const fromUrl = generateFromUrlParam(pathname, searchParams.toString());
        router.push(`/login?${fromUrl}`);
        return;
      }
      showBoundary(err);
    },
    [router, pathname, searchParams, showBoundary],
  );

  const fetchCalendarEvents = useCallback(async (range: CalendarRange) => {
    const startDate = range.start.toPlainDate().toString();
    const endDate = range.end.toPlainDate().toString();

    const tasks = await getCalendarTasks(
      startDate,
      endDate,
      initialPathnameRef.current,
    );

    return convertTasksToEvents(tasks);
  }, []);

  const fetchEvents = useCallback(
    async (range: CalendarRange) => {
      try {
        currentRangeRef.current = range;

        const events = await fetchCalendarEvents(range);

        return events;
      } catch (err: unknown) {
        handleCalendarError(err);
        return [];
      }
    },
    [fetchCalendarEvents, handleCalendarError],
  );

  const handleTaskChange = useCallback(async () => {
    try {
      if (currentRangeRef.current === null) {
        throw new Error("カレンダーの範囲が初期化されていません");
      }

      const events = await fetchCalendarEvents(currentRangeRef.current);

      eventsService.set(events);
    } catch (err: unknown) {
      handleCalendarError(err);
    }
  }, [fetchCalendarEvents, eventsService, handleCalendarError]);

  const calendar = useNextCalendarApp(
    createCalendarConfig({
      plugins: [eventsService],
      onEventClick: handleEventClick,
      fetchEvents,
    }),
  );

  useEffect(() => {
    window.addEventListener("task-created", handleTaskChange);
    window.addEventListener("task-updated", handleTaskChange);
    window.addEventListener("task-deleted", handleTaskChange);

    return () => {
      window.removeEventListener("task-created", handleTaskChange);
      window.removeEventListener("task-updated", handleTaskChange);
      window.removeEventListener("task-deleted", handleTaskChange);
    };
  }, [handleTaskChange]);

  return { calendar };
}
