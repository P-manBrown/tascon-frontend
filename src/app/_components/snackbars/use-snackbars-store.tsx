import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Snackbar } from './snackbar'

type SnackbarProps = React.ComponentProps<typeof Snackbar>

type OpenSnackbarParams = Pick<
  SnackbarProps,
  'severity' | 'message' | 'actionButton'
>

type SnackbarsState = {
  snackbars: SnackbarProps[]
  openSnackbar: (params: OpenSnackbarParams) => void
  closeSnackbar: (id: SnackbarProps['id']) => void
  closeAllSnackbars: () => void
  cleanupSnackbar: (id: SnackbarProps['id']) => void
}

export const useSnackbarsStore = create<SnackbarsState>()(
  devtools((set) => ({
    snackbars: [],
    openSnackbar: (params) => {
      set((state) => {
        const oldSnackbars = state.snackbars.map((snackbar) =>
          snackbar.isOpen ? { ...snackbar, isOpen: false } : snackbar,
        )
        const newSnackbar = {
          id: state.snackbars.splice(-1)[0]?.id + 1 || 0,
          isOpen: true,
          ...params,
        }
        return { snackbars: [...oldSnackbars, newSnackbar] }
      })
    },
    closeSnackbar: (id) => {
      set((state) => {
        const newSnackbars = state.snackbars.map((snackbar) =>
          snackbar.id === id ? { ...snackbar, isOpen: false } : snackbar,
        )
        return { snackbars: newSnackbars }
      })
    },
    closeAllSnackbars: () => {
      set((state) => {
        const newSnackbars = state.snackbars.map((snackbar) => ({
          ...snackbar,
          isOpen: false,
        }))
        return { snackbars: newSnackbars }
      })
    },
    cleanupSnackbar: (id) => {
      set((state) => {
        const newSnackbars = state.snackbars.filter(
          (snackbar) => snackbar.id > id || snackbar.isOpen,
        )
        return { snackbars: newSnackbars }
      })
    },
  })),
)
