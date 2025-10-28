import { createContext } from 'react'

export const LinkSidebarQueryContext = createContext<
  Record<string, string> | undefined
>(undefined)
