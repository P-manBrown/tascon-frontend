import { UserPage } from '@/components/pages/user-page'

// TEMP: https://github.com/vercel/next.js/issues/58123
// TEMP: https://github.com/vercel/next.js/issues/59316

type Props = {
  params: Promise<{ id: string }>
}

export default async function User(props: Props) {
  const params = await props.params
  const { id } = params

  return <UserPage id={id} />
}
