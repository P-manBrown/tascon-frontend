import { Suspense } from 'react'
import { UserPage, LoadingUserPage } from '@/components/pages/user-page'

type Props = {
  params: {
    id: string
  }
}

export default function User({ params: { id } }: Props) {
  return (
    <Suspense fallback={<LoadingUserPage />}>
      <UserPage id={id} />
    </Suspense>
  )
}
