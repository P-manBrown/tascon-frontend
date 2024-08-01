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
        const isActive = `/${segment}` === link.href
        return (
          <li key={link.name}>
            <Link
              key={link.name}
              href={link.href}
              className={`block px-2 py-1 ${
                isActive
                  ? 'pointer-events-none relative font-bold text-black after:absolute after:-bottom-1 after:right-0 after:h-1 after:w-full after:rounded-t-sm after:bg-gradient-to-t after:from-gray-200 after:to-gray-500 after:to-35% after:content-[""]'
                  : 'font-semibold text-gray-500 hover:text-black'
              }`}
              prefetch={!isActive}
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
