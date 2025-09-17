type Props = {
  children: React.ReactNode
  blocks: React.ReactNode
  contacts: React.ReactNode
  suggestions: React.ReactNode
}

export default async function Layout({
  children,
  blocks,
  contacts,
  suggestions,
}: Props) {
  return (
    <div>
      {children}
      <div className="mt-5 space-y-8">
        {contacts}
        {blocks}
        {suggestions}
      </div>
    </div>
  )
}
