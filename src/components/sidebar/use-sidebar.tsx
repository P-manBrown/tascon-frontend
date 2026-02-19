import { usePathname, useSearchParams } from 'next/navigation'
import { useQueryState, parseAsStringLiteral } from 'nuqs'
import { useCallback, useEffect } from 'react'
import { useMediaQuery } from '@/utils/media-query/use-media-query'

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

type Params = {
  defaultState: 'open' | 'closed'
}

export function useSidebar({ defaultState }: Params) {
  const pathname = usePathname()
  const params = useSearchParams()
  const [sidebar, setSidebar] = useQueryState(
    sidebarQueryKey,
    parseAsStringLiteral([
      sidebarStates.open,
      sidebarStates.closed,
    ]).withDefault(
      defaultState === 'open' ? sidebarStates.open : sidebarStates.closed,
    ),
  )
  const isOpen = sidebar === sidebarStates.open
  const { isMatch: isNarrowScreen } = useMediaQuery(narrowScreenBreakpoint)
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

  return {
    isOpen,
    linkSidebarQuery,
    openSidebar,
    closeSidebar,
  }
}
