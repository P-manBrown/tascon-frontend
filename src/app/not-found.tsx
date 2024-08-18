import Link from 'next/link'
import { NotFoundContent } from '@/components/contents/not-found-content'

export default function NotFound() {
  return (
    <main className="mx-3 flex min-h-dvh items-center justify-center">
      <div className="text-center">
        <p className="text-4xl font-semibold text-red-600 md:text-5xl">404</p>
        <h1 className="mb-5 mt-1.5 text-4xl font-bold tracking-tight md:mt-3 md:text-6xl">
          Page not found
        </h1>
        <NotFoundContent
          message="お探しのページが見つかりませんでした。"
          link={
            <Link href="/" className="btn btn-success mb-7 w-60">
              トップページへ
            </Link>
          }
        />
      </div>
    </main>
  )
}
