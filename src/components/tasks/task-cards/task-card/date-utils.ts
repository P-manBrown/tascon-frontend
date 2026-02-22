function isSameDay(startDate: Date, endDate: Date): boolean {
  return (
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate()
  )
}

function isDefaultStartTime(startDate: Date): boolean {
  return startDate.getHours() === 0 && startDate.getMinutes() === 0
}

function isDefaultEndTime(endDate: Date): boolean {
  return endDate.getHours() === 23 && endDate.getMinutes() === 59
}

export function checkShouldShowSingleDate(
  startsAt?: string,
  endsAt?: string,
): boolean {
  if (!startsAt || !endsAt) {
    return false
  }

  const startDate = new Date(startsAt)
  const endDate = new Date(endsAt)

  return (
    isSameDay(startDate, endDate) &&
    isDefaultStartTime(startDate) &&
    isDefaultEndTime(endDate)
  )
}
