import Image from 'next/image'
import logo from 'public/logos/logo.png'
import { LoginLink } from '../login-link'
import { SignUpLink } from '../sign-up-link'

export function HomeHeader() {
  return (
    <header className="bg-theme px-safe border-b border-b-gray-200">
      <nav className="flex h-14 items-center px-4 py-2">
        <Image
          src={logo}
          width={123}
          height={40}
          alt="TASCON"
          priority={true}
        />
        <div className="flex flex-grow justify-end gap-x-4">
          <LoginLink />
          <SignUpLink className="h-8 w-52 max-lg:hidden" />
        </div>
      </nav>
    </header>
  )
}
