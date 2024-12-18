import { useCallback, useEffect, useRef, useState } from 'react'

type Params = {
  containerRef: React.RefObject<HTMLElement | null>
  contentRef: React.RefObject<HTMLElement | null>
  isEditorOpen: boolean
}

type AnimateHeightParams = {
  fromHeight: number
  toHeight: number
  delay?: number
}

const animateBaseOptions: KeyframeAnimationOptions = {
  duration: 200,
  easing: 'cubic-bezier(0, 0, 0.2, 1)',
  fill: 'forwards',
}

export function useEditableTextAnimation({
  containerRef,
  contentRef,
  isEditorOpen,
}: Params) {
  const containerHeightRef = useRef(0)
  const [isEditorExpanded, setIsEditorExpanded] = useState(false)
  const isAnimating =
    (!isEditorOpen && isEditorExpanded) || (isEditorOpen && !isEditorExpanded)

  const animateHeight = useCallback(
    ({ fromHeight, toHeight, delay }: AnimateHeightParams) => {
      if (containerRef.current) {
        const animation = containerRef.current.animate(
          [{ height: `${fromHeight}px` }, { height: `${toHeight}px` }],
          { ...animateBaseOptions, delay },
        )
        animation.onfinish = () => {
          if (containerRef.current) {
            animation.commitStyles()
            animation.cancel()
          }
        }
        animation.oncancel = () => {
          setIsEditorExpanded((prev) => !prev)
        }
        return animation
      }
    },
    [containerRef],
  )

  const animateExpansion = useCallback(() => {
    if (containerRef.current) {
      return animateHeight({
        fromHeight: containerHeightRef.current,
        toHeight: containerRef.current.scrollHeight,
      })
    }
  }, [containerRef, animateHeight])

  const animateCollapse = useCallback(() => {
    if (containerRef.current && contentRef.current) {
      return animateHeight({
        fromHeight: containerHeightRef.current,
        toHeight: contentRef.current.clientHeight,
        delay: 200,
      })
    }
  }, [containerRef, contentRef, animateHeight])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      const resizeObserver = new ResizeObserver(() => {
        containerHeightRef.current = container.clientHeight
      })
      resizeObserver.observe(container)

      return () => resizeObserver.disconnect()
    }
  }, [containerRef])

  useEffect(() => {
    const currentContainerRef = containerRef
    if (isEditorOpen && !isEditorExpanded) {
      const expandAnimation = animateExpansion()

      return () => {
        if (expandAnimation && currentContainerRef.current) {
          expandAnimation.commitStyles()
          expandAnimation.cancel()
        }
      }
    } else if (!isEditorOpen && isEditorExpanded) {
      const collapseAnimation = animateCollapse()

      return () => {
        if (collapseAnimation && currentContainerRef.current) {
          collapseAnimation.commitStyles()
          collapseAnimation.cancel()
        }
      }
    }
  }, [
    isEditorOpen,
    isEditorExpanded,
    animateExpansion,
    animateCollapse,
    containerRef,
  ])

  return { isAnimating, containerHeight: containerHeightRef.current }
}
