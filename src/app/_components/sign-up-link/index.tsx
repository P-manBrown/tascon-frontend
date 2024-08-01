import Link from 'next/link'

type Props = {
  className: string
}

export function SignUpLink({ className }: Props) {
  return (
    <Link
      href="/sign-up"
      className={`btn btn-shadow rounded bg-gradient-to-br from-violet-900 to-orange-600 text-base text-white ${className}`}
    >
      TASCONを使ってみる
    </Link>
  )
}
