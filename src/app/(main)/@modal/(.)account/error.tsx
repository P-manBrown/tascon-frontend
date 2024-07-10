'use client'

import { AccountErrorPage } from '@/components/pages/account-error-page'
import type { ErrorProps } from '@/types/error'

export default function Error(props: ErrorProps) {
  return <AccountErrorPage {...props} />
}
