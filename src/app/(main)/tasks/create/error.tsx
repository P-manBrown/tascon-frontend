'use client'

import { CreateTaskErrorPage } from '@/components/pages/create-task-error-page'
import type { ErrorProps } from '@/types/error'

export default function Error(props: ErrorProps) {
  return (
    <div className="p-20">
      <CreateTaskErrorPage {...props} />
    </div>
  )
}
