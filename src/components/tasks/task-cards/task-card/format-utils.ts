function formatDateOnly(date: Date) {
  return date.toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
  })
}

function formatDateWithTime(date: Date) {
  return date.toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })
}

type HasBothDefaultTimesParams = {
  startHours: number
  startMinutes: number
  endHours: number
  endMinutes: number
}

function hasBothDefaultTimes({
  startHours,
  startMinutes,
  endHours,
  endMinutes,
}: HasBothDefaultTimesParams) {
  return (
    startHours === 0 &&
    startMinutes === 0 &&
    endHours === 23 &&
    endMinutes === 59
  )
}

export function formatStartDateTime(
  startDateString: string,
  endDateString?: string,
) {
  const startDate = new Date(startDateString)
  const hours = startDate.getHours()
  const minutes = startDate.getMinutes()

  if (endDateString !== undefined) {
    const endDate = new Date(endDateString)
    const endHours = endDate.getHours()
    const endMinutes = endDate.getMinutes()

    if (
      hasBothDefaultTimes({
        startHours: hours,
        startMinutes: minutes,
        endHours,
        endMinutes,
      })
    ) {
      return formatDateOnly(startDate)
    }
  } else {
    const isDefaultTime = hours === 0 && minutes === 0

    if (isDefaultTime) {
      return formatDateOnly(startDate)
    }
  }

  return formatDateWithTime(startDate)
}

export function formatEndDateTime(
  endDateString: string,
  startDateString?: string,
) {
  const endDate = new Date(endDateString)
  const hours = endDate.getHours()
  const minutes = endDate.getMinutes()

  if (startDateString !== undefined) {
    const startDate = new Date(startDateString)
    const startHours = startDate.getHours()
    const startMinutes = startDate.getMinutes()

    if (
      hasBothDefaultTimes({
        startHours,
        startMinutes,
        endHours: hours,
        endMinutes: minutes,
      })
    ) {
      return formatDateOnly(endDate)
    }
  } else {
    const isDefaultTime = hours === 23 && minutes === 59

    if (isDefaultTime) {
      return formatDateOnly(endDate)
    }
  }

  return formatDateWithTime(endDate)
}

export function formatMinutesToHoursAndMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}時間${remainingMinutes}分`
}
