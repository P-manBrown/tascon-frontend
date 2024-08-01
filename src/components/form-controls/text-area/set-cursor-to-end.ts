export const setCursorToEnd = (element: HTMLTextAreaElement) => {
  const length = element.value.length
  element.setSelectionRange(length, length)
}
