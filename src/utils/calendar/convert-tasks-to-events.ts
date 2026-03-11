const timezone = 'Asia/Tokyo'

function parseDateTime(isoString: string) {
  const hasTimeComponent = isoString.includes('T')

  if (hasTimeComponent) {
    const instant = Temporal.Instant.from(isoString)
    return instant.toZonedDateTimeISO(timezone)
  }

  return Temporal.PlainDate.from(isoString)
}

type ConvertTasksToEventsParams = {
  id: number
  name: string
  startsAt: string
  endsAt: string
}[]

export function convertTasksToEvents(tasks: ConvertTasksToEventsParams) {
  return tasks.map((task) => {
    const start = parseDateTime(task.startsAt)
    const end = parseDateTime(task.endsAt)

    return {
      id: task.id,
      title: task.name,
      start,
      end,
    }
  })
}
