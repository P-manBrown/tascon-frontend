import { useState } from 'react'

export function useDragInside() {
  const [isDraggingInside, setIsDraggingInside] = useState(false)

  const handleMouseEnter = (ev: React.MouseEvent<HTMLDivElement>) => {
    if (ev.buttons === 1) {
      setIsDraggingInside(true)
    }
  }

  const handleMouseLeave = () => {
    if (isDraggingInside) {
      setIsDraggingInside(false)
    }
  }

  const handleMouseUp = () => {
    if (isDraggingInside) {
      setIsDraggingInside(false)
    }
  }

  return { isDraggingInside, handleMouseEnter, handleMouseLeave, handleMouseUp }
}
