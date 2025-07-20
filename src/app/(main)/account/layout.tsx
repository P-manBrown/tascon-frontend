type Props = {
  children: React.ReactNode
}

export default function AccountLayout({ children }: Props) {
  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto w-[90%] py-12 md:w-[40rem]">{children}</div>
    </div>
  )
}
