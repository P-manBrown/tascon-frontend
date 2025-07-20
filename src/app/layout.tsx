import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Snackbars } from './_components/snackbars'
import './globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'TASCON',
    template: '%s | TASCON',
  },
  description: 'タスク管理とテンプレートの共有',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#F5F7FC',
  width: 'device-width',
  viewportFit: 'cover',
  initialScale: 1,
  maximumScale: 1,
}

type Props = {
  children: React.ReactNode
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="ja">
      {/* 'lg:overflow-hidden' for the route of the main group only. */}
      <body className="font-body has-[dialog:modal]:overflow-hidden has-[main#main]:overflow-hidden">
        <NuqsAdapter>{children}</NuqsAdapter>
        <Snackbars />
      </body>
    </html>
  )
}
