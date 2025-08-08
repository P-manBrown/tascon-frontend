import {
  ArrowTopRightOnSquareIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline'
import { IconButton } from '../buttons/icon-button'

type Props = {
  isOpen: boolean
  onOpenButtonClick: (ev: React.MouseEvent<HTMLButtonElement>) => void
  onCloseButtonClick: (ev: React.MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
}

const widthClasses = 'w-64 max-md:w-screen'

export function Sidebar({
  isOpen,
  onOpenButtonClick,
  onCloseButtonClick,
  children,
}: Props) {
  return (
    <div className={`h-full ${isOpen ? '' : 'relative'}`}>
      <aside
        className={`bg-theme max-md:pb-safe flex h-full flex-col overflow-hidden border-r border-r-gray-300 transition-[width] duration-200 ease-out ${
          isOpen ? widthClasses : 'w-0'
        }`}
        aria-label="サイドバー"
        inert={!isOpen}
      >
        <div
          className={`h-full border-b border-b-gray-300 p-3 max-sm:min-w-screen ${widthClasses}`}
        >
          {children}
        </div>
        <div
          className={`flex items-center overflow-hidden px-3 py-1.5 ${widthClasses}`}
        >
          <a
            href="https://forms.gle/F9d8j2XnjT2mAfRc9"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline-success h-8 text-base font-normal"
          >
            お問い合わせ
            <span className="ml-1">
              <ArrowTopRightOnSquareIcon className="size-4" />
            </span>
          </a>
          <div className="ml-5 h-9 border-l border-l-gray-300" />
          <IconButton
            className="my-auto ml-3 size-8"
            aria-label="サイドバーを閉じる"
            onClick={onCloseButtonClick}
          >
            <ChevronDoubleLeftIcon className="size-6" />
          </IconButton>
        </div>
      </aside>
      {!isOpen && (
        <div className="animate-slide-in-left bg-theme max-md:mb-safe absolute bottom-0.5 z-50 rounded-e-sm border-y border-r border-gray-300">
          <IconButton
            className="h-10 w-8 rounded-s-none"
            aria-label="サイドバーを開く"
            onClick={onOpenButtonClick}
          >
            <ChevronDoubleRightIcon className="size-6" />
          </IconButton>
        </div>
      )}
    </div>
  )
}
