type Props = {
  className: string;
  children: React.ReactNode;
};

export function ActivePageNumber({ className, children }: Props) {
  return (
    <span
      className={`z-10 flex items-center justify-center border border-blue-600 bg-blue-50 font-medium text-blue-600 text-sm ${className}`}
    >
      {children}
    </span>
  );
}
