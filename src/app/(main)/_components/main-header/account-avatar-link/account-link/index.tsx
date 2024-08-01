'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CurrentUserAvatar } from '@/components/avatars/current-user-avatar'

type Props = Pick<
  React.ComponentProps<typeof CurrentUserAvatar>,
  'size' | 'name' | 'avatarUrl'
>

export function AccountLink(props: Props) {
  const pathname = usePathname()
  const [ts, setTs] = useState('')
  const [isActive, setIsActive] = useState(pathname === '/account')

  useEffect(() => {
    if (pathname === '/account') {
      setIsActive(true)
    } else {
      setIsActive(false)
    }
    setTs(Date.now().toString())
  }, [pathname])

  return (
    // TEMP: https://github.com/vercel/next.js/issues/54173
    <Link
      href={{ pathname: '/account', query: { ts } }}
      className={`btn-avatar ${
        isActive ? 'pointer-events-none ring ring-gray-500' : ''
      }`}
      aria-label="アカウント"
      prefetch={!isActive}
      tabIndex={isActive ? -1 : undefined}
    >
      <CurrentUserAvatar priority={true} {...props} />
    </Link>
  )
}
