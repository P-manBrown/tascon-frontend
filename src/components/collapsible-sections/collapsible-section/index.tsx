import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'
import { useEffect, useRef, useState } from 'react'

type Props = {
  minHeight: number
  className?: string
  initialIsCollapsible?: boolean
  children: React.ReactNode
}

export function CollapsibleSection({
  minHeight,
  initialIsCollapsible = false,
  className = '',
  children,
}: Props) {
  const contentRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [hasOverflowChecked, setHasOverflowChecked] = useState(false)
  const [isCollapsible, setIsCollapsible] = useState(initialIsCollapsible)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [extendedHeight, setExtendedHeight] = useState<number | null>(null)

  const handleClick = () => {
    setIsCollapsed((prev) => !prev)
  }

  useEffect(() => {
    const container = containerRef.current
    if (container && container.scrollHeight > container.clientHeight) {
      setIsCollapsible(true)
    } else {
      setIsCollapsible(false)
    }
    setHasOverflowChecked(true)
  }, [])

  useEffect(() => {
    const content = contentRef.current
    if (content !== null) {
      const resizeObserver = new ResizeObserver(() => {
        const isCurrentlyOverflowing = content.clientHeight > minHeight
        setIsCollapsible(isCurrentlyOverflowing)
        const button = buttonRef.current
        if (button !== null) {
          setExtendedHeight(content.offsetHeight + button.offsetHeight)
        } else {
          setExtendedHeight(content.offsetHeight)
        }
      })

      resizeObserver.observe(content)

      return () => {
        resizeObserver.disconnect()
      }
    }
  }, [minHeight])

  useEffect(() => {
    const container = containerRef.current
    if (container !== null) {
      if (isCollapsed) {
        setExtendedHeight(minHeight)
      } else {
        setExtendedHeight(container.scrollHeight)
      }
    }
  }, [isCollapsed, minHeight])

  return (
    <div
      ref={containerRef}
      className={`${hasOverflowChecked ? '' : 'pointer-events-none animate-pulse blur-sm'} ${
        isCollapsible
          ? `relative transition-[height] delay-100 duration-200 ease-out ${
              isCollapsed ? 'overflow-clip' : 'overflow-hidden pb-10'
            }`
          : ''
      }`}
      style={{
        height:
          !isCollapsible || isCollapsed
            ? `${minHeight}px`
            : `${extendedHeight}px`,
      }}
    >
      <div ref={contentRef}>{children}</div>
      {isCollapsible && (
        <button
          ref={buttonRef}
          className={`group absolute bottom-0 left-0 flex w-full justify-center p-1.5 text-sm hover:font-semibold ${
            isCollapsed
              ? 'h-20 items-end bg-gradient-to-t from-white from-40% via-white/50'
              : 'h-10 items-center bg-white'
          } ${className}`}
          onClick={handleClick}
        >
          <span className="flex justify-center gap-1.5 select-none group-hover:stroke-black">
            {isCollapsed ? (
              <>
                <ChevronDownIcon className="size-4 self-center" />
                展開する
              </>
            ) : (
              <>
                <ChevronUpIcon className="size-4 self-center" />
                折りたたむ
              </>
            )}
          </span>
        </button>
      )}
    </div>
  )
}
