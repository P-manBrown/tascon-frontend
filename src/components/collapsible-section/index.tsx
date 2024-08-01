import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'
import { useEffect, useRef, useState } from 'react'

type Props = {
  height: number
  className?: string
  children: React.ReactNode
}

export function CollapsibleSection({
  height,
  className = '',
  children,
}: Props) {
  const divRef = useRef<HTMLDivElement>(null)
  const collapsibleDivRef = useRef<HTMLDivElement>(null)
  const [hasOverflowChecked, setHasOverflowChecked] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [currentHeight, setCurrentHeight] = useState(height)

  const handleClick = () => {
    setIsCollapsed((prev) => !prev)
  }

  useEffect(() => {
    const div = divRef.current
    if (div && div.scrollHeight > div.clientHeight) {
      setIsOverflowing(true)
    } else {
      setIsOverflowing(false)
    }
    setHasOverflowChecked(true)
  }, [])

  useEffect(() => {
    if (collapsibleDivRef.current) {
      if (isCollapsed) {
        setCurrentHeight(height)
      } else {
        setCurrentHeight(collapsibleDivRef.current.scrollHeight)
      }
    }
  }, [isCollapsed, height])

  if (!hasOverflowChecked) {
    return (
      <div
        ref={divRef}
        className="animate-pulse overflow-hidden blur-sm"
        style={{ height: `${height}px` }}
      >
        {children}
      </div>
    )
  }

  return isOverflowing ? (
    <div
      ref={collapsibleDivRef}
      className={`relative overflow-hidden transition-[height] delay-100 duration-200 ease-out ${
        isCollapsed ? '' : 'pb-10'
      }`}
      style={{ height: `${currentHeight}px` }}
    >
      {children}
      <button
        className={`group absolute bottom-0 left-0 flex w-full justify-center p-1.5 text-sm hover:font-semibold ${
          isCollapsed
            ? 'h-20 items-end bg-gradient-to-t from-white from-40% via-white/50'
            : 'h-10 items-center bg-white'
        } ${className}`}
        onClick={handleClick}
      >
        <span className="flex select-none justify-center gap-1 group-hover:stroke-black">
          {isCollapsed ? (
            <>
              <ChevronDownIcon className="h-4 w-4 self-center" />
              全て表示
            </>
          ) : (
            <>
              <ChevronUpIcon className="h-4 w-4 self-center" />
              詳細を非表示
            </>
          )}
        </span>
      </button>
    </div>
  ) : (
    <div style={{ height: `${height}px` }}>{children}</div>
  )
}
