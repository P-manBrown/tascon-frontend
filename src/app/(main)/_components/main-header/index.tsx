import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import smallLogo from 'public/logos/logo-small.png'
import { AccountLink } from './account-avatar-link/account-link'
import { HeaderAvatar, LoadingHeaderAvatar } from './header-avatar'
import { NavLinks } from './nav-links'

export function MainHeader() {
  return (
    <header className="bg-theme px-safe border-b border-b-gray-200">
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
          <AccountLink>
            <Suspense fallback={<LoadingHeaderAvatar />}>
              <HeaderAvatar />
            </Suspense>
          </AccountLink>
        </div>
        <NavLinks className="hidden-scrollbar justify-between overflow-scroll py-1 text-sm whitespace-nowrap md:hidden" />
      </nav>
    </header>
  )
}
