import { Suspense } from 'react'
import { UserPage, LoadingUserPage } from '@/components/pages/user-page'

type Props = {
  params: Promise<{ id: string }>
}

export default async function User(props: Props) {
  const params = await props.params
  const { id } = params

  return (
    <Suspense fallback={<LoadingUserPage />}>
      <UserPage id={id} />
    </Suspense>
  )
}
