import { AccountPage } from '@/components/pages/account-page'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'アカウント',
}

export default function Account() {
  return <AccountPage />
}
