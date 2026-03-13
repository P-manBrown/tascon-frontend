type Props = {
  className?: string;
  upperLeftIcon?: React.ReactElement;
  children: React.ReactNode;
};

export function ModalContent({
  className = "",
  upperLeftIcon,
  children,
}: Props) {
  return (
    <div className={`p-1 pb-safe ${className}`}>
      {upperLeftIcon && <div className="p-2">{upperLeftIcon}</div>}
      <div className={`px-3 pb-12 md:px-12 ${upperLeftIcon ? "" : "pt-12"}`}>
        {children}
      </div>
    </div>
  );
}
