type Props = {
  children: string | undefined
}

export function ValidationErrorMessage({ children }: Props) {
  return <p className="px-1 text-sm font-semibold text-red-600">{children}</p>
}
