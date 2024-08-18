type Props = {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <main className="md:flex md:min-h-dvh md:items-center">
      <div className="mx-auto my-12 w-full max-w-md md:my-0 md:border md:shadow-lg md:shadow-black/25">
        <div className="mx-6 md:m-12">{children}</div>
      </div>
    </main>
  )
}
