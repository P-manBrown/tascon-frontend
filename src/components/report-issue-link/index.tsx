import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'

type Props = {
  className?: string
  info?: string
}

export function ReportIssueLink({ className = '', info }: Props) {
  const body = `※ 以下の値は編集しないでください。\n${info}`
  const params = info ? `?${new URLSearchParams({ body }).toString()}` : ''

  return (
    <a
      href={`https://github.com/P-manBrown/tascon-backend/issues/new${params}`}
      target="_blank"
      rel="noreferrer"
      className={`link inline-flex items-center ${className}`}
      tabIndex={0}
    >
      問題を報告
      <span className="ml-0.5">
        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
      </span>
    </a>
  )
}
