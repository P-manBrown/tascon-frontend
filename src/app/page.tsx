import { HomeHeader } from './_components/home-header'
import { SignUpLink } from './_components/sign-up-link'
import { BottomBar } from '../components/bottom-bar'

export default function Home() {
  return (
    <>
      <HomeHeader />
      <main>
        <BottomBar className="lg:hidden">
          <SignUpLink className="h-9 w-64" />
        </BottomBar>
      </main>
    </>
  )
}
