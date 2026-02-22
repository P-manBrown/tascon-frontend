import { useEffect, useRef, useState } from 'react'

type Params = {
  hasPrevPage: boolean
  wheelTransitionThreshold: number
  touchTransitionThreshold: number
}

export function useScrollTriggerPrevLink({
  hasPrevPage,
  wheelTransitionThreshold,
  touchTransitionThreshold,
}: Params) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const accumulatedDeltaRef = useRef(0)
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartYRef = useRef(0)
  const touchLastYRef = useRef(0)
  const [isLinkVisible, setIsLinkVisible] = useState(false)
  const [pullHeight, setPullHeight] = useState(0)
  const [isClicked, setIsClicked] = useState(false)
  const [shouldTransition, setShouldTransition] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  const transitionThreshold = isTouch
    ? touchTransitionThreshold
    : wheelTransitionThreshold
  const pullProgress = Math.min((pullHeight / transitionThreshold) * 100, 100)

  const resetPullState = () => {
    accumulatedDeltaRef.current = 0
    setPullHeight(0)
    setShouldTransition(false)
  }

  const handleWheel = (ev: React.WheelEvent<HTMLDivElement>) => {
    if (!hasPrevPage || !isLinkVisible || shouldTransition) {
      return
    }

    setIsTouch(false)

    if (ev.deltaY < 0) {
      accumulatedDeltaRef.current += Math.abs(ev.deltaY)
      setPullHeight(accumulatedDeltaRef.current)

      const hasReachedThreshold =
        accumulatedDeltaRef.current >= wheelTransitionThreshold

      if (hasReachedThreshold && !shouldTransition) {
        setShouldTransition(true)
        linkRef.current?.click()
      }

      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current)
      }

      wheelTimeoutRef.current = setTimeout(() => {
        const isBelowThreshold =
          accumulatedDeltaRef.current < wheelTransitionThreshold
        if (isBelowThreshold) {
          resetPullState()
        }
      }, 500)
    } else if (ev.deltaY > 0) {
      resetPullState()
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current)
      }
    }
  }

  const handleTouchStart = (ev: React.TouchEvent<HTMLDivElement>) => {
    if (!hasPrevPage || !isLinkVisible || shouldTransition) {
      return
    }

    setIsTouch(true)

    touchStartYRef.current = ev.touches[0].clientY
    touchLastYRef.current = ev.touches[0].clientY
  }

  const handleTouchMove = (ev: React.TouchEvent<HTMLDivElement>) => {
    if (!hasPrevPage || !isLinkVisible || shouldTransition) {
      return
    }

    const touchY = ev.touches[0].clientY
    const deltaY = touchLastYRef.current - touchY

    if (deltaY < 0) {
      accumulatedDeltaRef.current += Math.abs(deltaY)
      touchLastYRef.current = touchY
      setPullHeight(accumulatedDeltaRef.current)

      const hasReachedThreshold =
        accumulatedDeltaRef.current >= touchTransitionThreshold

      if (hasReachedThreshold && !shouldTransition) {
        setShouldTransition(true)
        linkRef.current?.click()
      }

      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current)
      }

      wheelTimeoutRef.current = setTimeout(() => {
        const isBelowThreshold =
          accumulatedDeltaRef.current < touchTransitionThreshold
        if (isBelowThreshold) {
          resetPullState()
        }
      }, 1000)
    } else if (deltaY > 0) {
      resetPullState()
      touchLastYRef.current = touchY
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current)
      }
    }
  }

  useEffect(() => {
    if (linkRef.current && hasPrevPage) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsLinkVisible(entry.isIntersecting)

          if (!entry.isIntersecting) {
            resetPullState()
            if (wheelTimeoutRef.current) {
              clearTimeout(wheelTimeoutRef.current)
            }
          }
        },
        {
          threshold: 0.5,
        },
      )

      observer.observe(linkRef.current)

      return () => {
        observer.disconnect()
      }
    }
  }, [hasPrevPage])

  return {
    linkRef,
    pullProgress,
    shouldTransition,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    isClicked,
    setIsClicked,
  }
}
