'use client'

import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'

type Props = {
  className: string
}

const navLinks = [
  { name: 'タスク', href: '/tasks' },
  { name: 'テンプレート', href: '/templates' },
  { name: 'ユーザー', href: '/users' },
]

export function NavLinks({ className }: Props) {
  const segment = useSelectedLayoutSegment()

  return (
    <ul className={`flex ${className}`}>
      {navLinks.map((link) => {
        const isActive = link.href.startsWith(`/${segment}`)
        return (
          <li key={link.name}>
            <Link
              key={link.name}
              href={link.href}
              className={`block px-2 py-1 font-bold ${
                isActive
                  ? 'pointer-events-none relative text-black after:absolute after:right-0 after:-bottom-1 after:h-1 after:w-full after:rounded-t-sm after:bg-gray-600 after:content-[""]'
                  : 'text-gray-500 hover:text-black'
              }`}
              prefetch={isActive ? false : null}
              tabIndex={isActive ? -1 : undefined}
            >
              {link.name}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
