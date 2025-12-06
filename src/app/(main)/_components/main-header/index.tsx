import { PlusCircleIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import smallLogo from 'public/logos/logo-small.png'
import { AccountLink } from './account-avatar-link/account-link'
import { HeaderAvatar, LoadingHeaderAvatar } from './header-avatar'
import { NavLinks } from './nav-links'

export function MainHeader() {
  return (
    <header className="bg-theme px-safe border-b border-b-gray-300">
      <nav className="px-2">
        <div className="flex justify-between py-1">
          <div className="flex flex-row">
            <Link href="/" className="mr-8">
              <Image
                src={smallLogo}
                width={117}
                height={32}
                alt="TASCON"
                priority={true}
              />
            </Link>
            <NavLinks className="space-x-3.5 max-md:hidden" />
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/tasks/create"
              className="btn btn-ghost h-fit p-1 text-sm"
            >
              <span className="flex items-center gap-x-0.5">
                <PlusCircleIcon className="size-4 stroke-3" />
                タスク作成
              </span>
            </Link>
            <AccountLink>
              <Suspense fallback={<LoadingHeaderAvatar />}>
                <HeaderAvatar />
              </Suspense>
            </AccountLink>
          </div>
        </div>
        <NavLinks className="hidden-scrollbar justify-between overflow-scroll py-1 text-sm whitespace-nowrap md:hidden" />
      </nav>
    </header>
  )
}
