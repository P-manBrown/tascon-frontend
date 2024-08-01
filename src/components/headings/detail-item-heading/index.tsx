type Props = {
  children: string
}

export function DetailItemHeading({ children }: Props) {
  return <h2 className="font-semibold">{children}</h2>
}
