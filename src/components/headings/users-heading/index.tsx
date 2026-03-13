type Props = {
  children: React.ReactNode;
};

export function UsersHeading({ children }: Props) {
  return <h1 className="font-bold text-2xl">{children}</h1>;
}
