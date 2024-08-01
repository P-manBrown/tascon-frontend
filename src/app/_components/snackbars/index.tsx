'use client'

import { Snackbar } from './snackbar'
import { SnackbarPortal } from './snackbar-portal'
import { useSnackbarsStore } from './use-snackbars-store'

export function Snackbars() {
  const snackbars = useSnackbarsStore((state) => state.snackbars)

  return (
    <>
      {snackbars.map((snackbar) => {
        return (
          <SnackbarPortal key={snackbar.id}>
            <Snackbar
              key={snackbar.id}
              id={snackbar.id}
              isOpen={snackbar.isOpen}
              severity={snackbar.severity}
              message={snackbar.message}
              actionButton={snackbar.actionButton}
            />
          </SnackbarPortal>
        )
      })}
    </>
  )
}
