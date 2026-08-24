"use client";

import { ScheduleXCalendar } from "@schedule-x/react";
import "temporal-polyfill/global";
import "@schedule-x/theme-default/dist/index.css";
import { useSharedTaskCalendar } from "./use-shared-task-calendar";

type Props = {
  shareId: string;
};

export function SharedTaskCalendar({ shareId }: Props) {
  const { calendar } = useSharedTaskCalendar({ shareId });

  return (
    <div className="h-full w-full [&_.sx-react-calendar-wrapper]:h-full">
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  );
}
