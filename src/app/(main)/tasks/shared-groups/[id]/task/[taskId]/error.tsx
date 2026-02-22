'use client'

import { TaskErrorPage } from '@/components/pages/task-error-page'
import type { ErrorProps } from '@/types/error'

export default function Error(props: ErrorProps) {
  return (
    <div className="p-20">
      <TaskErrorPage {...props} />
    </div>
  )
}
