import Image from 'next/image'
import Link from 'next/link'
import smallLogo from '/public/logos/logo-small.png'
import { Suspense } from 'react'
import {
  CurrentUserAvatarLink,
  LoadingAccountAvatarLink,
} from './account-avatar-link'
import { NavLinks } from './nav-links'

export function MainHeader() {
  return (
    <header className="border-b bg-theme px-safe">
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
          <Suspense fallback={<LoadingAccountAvatarLink />}>
            {/* @ts-expect-error */}
            <CurrentUserAvatarLink />
          </Suspense>
        </div>
        <NavLinks className="justify-between overflow-scroll whitespace-nowrap py-1 text-sm hidden-scrollbar md:hidden" />
      </nav>
    </header>
  )
}
