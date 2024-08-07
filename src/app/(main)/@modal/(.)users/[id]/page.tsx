import { UserPage } from '@/components/pages/user-page'

// TEMP: https://github.com/vercel/next.js/issues/58123
// TEMP: https://github.com/vercel/next.js/issues/59316

type Props = {
  params: {
    id: string
  }
}

export default function User({ params: { id } }: Props) {
  return <UserPage id={id} />
}
