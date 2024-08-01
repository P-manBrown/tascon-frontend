type Props = {
  className?: string
  upperLeftIcon?: React.ReactElement
  children: React.ReactNode
}

export function ModalContent({
  className = '',
  upperLeftIcon,
  children,
}: Props) {
  return (
    <div className={`px-1 pt-1 pb-safe md:pb-1 ${className}`}>
      {upperLeftIcon && <div className="p-2">{upperLeftIcon}</div>}
      <div className={`px-3 pb-12 md:px-12 ${upperLeftIcon ? '' : 'pt-12'}`}>
        {children}
      </div>
    </div>
  )
}
