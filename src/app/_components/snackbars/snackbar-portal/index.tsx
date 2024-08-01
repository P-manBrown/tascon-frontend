import 'client-only'
import { createPortal } from 'react-dom'

type Props = {
  children: React.ReactElement
}

export function SnackbarPortal({ children }: Props) {
  const modals = document.querySelectorAll('dialog:modal')
  const currentModal = modals[modals.length - 1]

  // Enable interaction with Snackbar even when a dialog is open in modal mode.
  // @ts-expect-error
  return currentModal ? createPortal(children, currentModal) : children
}
