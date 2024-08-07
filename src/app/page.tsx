import { Suspense } from 'react'
import { HomeHeader } from './_components/home-header'
import { HomeQueryParamSnackbar } from './_components/home-query-param-snackbar'
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
        <Suspense>
          <HomeQueryParamSnackbar />
        </Suspense>
      </main>
    </>
  )
}
