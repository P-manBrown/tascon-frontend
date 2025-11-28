type Props = {
  children: string
}

export function TasksHeading({ children }: Props) {
  return <h1 className="text-2xl font-bold">{children}</h1>
}
