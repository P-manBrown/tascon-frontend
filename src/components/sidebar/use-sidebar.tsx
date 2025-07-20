import { usePathname, useSearchParams } from 'next/navigation'
import { useQueryState, parseAsStringLiteral } from 'nuqs'
import { useCallback, useEffect, useState } from 'react'

const sidebarQueryKey = 'sidebar'
const sidebarStates = Object.freeze({
  open: 'open',
  closed: 'closed',
})

const narrowScreenBreakpoint = '(max-width:48rem)'

function getLinkSidebarQuery(isNarrowScreen: boolean) {
  if (isNarrowScreen) {
    return { [sidebarQueryKey]: sidebarStates.closed }
  }
  return undefined
}

export function useSidebar() {
  const pathname = usePathname()
  const params = useSearchParams()
  const [sidebar, setSidebar] = useQueryState(
    sidebarQueryKey,
    parseAsStringLiteral([
      sidebarStates.open,
      sidebarStates.closed,
    ]).withDefault(sidebarStates.open),
  )
  const isOpen = sidebar === sidebarStates.open
  const [isNarrowScreen, setIsNarrowScreen] = useState(false)
  const linkSidebarQuery = getLinkSidebarQuery(isNarrowScreen)

  const openSidebar = useCallback(() => {
    setSidebar(sidebarStates.open)
  }, [setSidebar])

  const closeSidebar = useCallback(() => {
    setSidebar(sidebarStates.closed)
  }, [setSidebar])

  useEffect(() => {
    if (!params.has(sidebarQueryKey)) {
      setSidebar(sidebar)
    }
  }, [pathname, params, setSidebar, sidebar])

  useEffect(() => {
    const mediaQuery = window.matchMedia(narrowScreenBreakpoint)
    setIsNarrowScreen(mediaQuery.matches)

    const handleChange = () => setIsNarrowScreen(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return {
    isOpen,
    linkSidebarQuery,
    openSidebar,
    closeSidebar,
  }
}
