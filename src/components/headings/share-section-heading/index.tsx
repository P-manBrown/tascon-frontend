type Props = {
  children: string;
};

export function ShareSectionHeading({ children }: Props) {
  return <h2 className="font-bold text-lg">{children}</h2>;
}
