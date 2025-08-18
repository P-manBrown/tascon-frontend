import { LoadingPage } from '@/components/pages/loading-page'

export default function Loading() {
  return (
    // 100dvh-2rem-6px:[Modal height] 1px:[Modal border] 6.75rem-env(safe-area-inset-bottom):[ModalContent padding]
    <div className="h-[calc(100dvh-2rem-6px-1px-6.75rem-env(safe-area-inset-bottom))]">
      <LoadingPage pageTitle="ユーザー詳細" />
    </div>
  )
}
