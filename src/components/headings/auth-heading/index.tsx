type Props = {
  className?: string;
  children: string;
};

export function AuthHeading({ className = "", children }: Props) {
  return (
    <h1 className={`text-center font-bold text-3xl ${className}`}>
      {children}
    </h1>
  );
}
