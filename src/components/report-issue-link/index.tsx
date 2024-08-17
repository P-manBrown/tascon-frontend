import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'

type Props = {
  className?: string
  info?: string
}

export function ReportIssueLink({ className = '', info }: Props) {
  const params = new URLSearchParams({
    title: `[Bug]: タイトル(${info})`,
    assignee: 'P-manBrown',
    template: 'bug.yml',
  }).toString()
  const issueUrl = 'https://github.com/P-manBrown/tascon-frontend/issues/new'
  const href = `${issueUrl}${info ? `?${params}` : ''}`

  return (
    <a
      href={href}
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
