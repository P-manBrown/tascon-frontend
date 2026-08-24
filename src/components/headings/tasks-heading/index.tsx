type Props = {
  children: string;
};

export function TasksHeading({ children }: Props) {
  return <h1 className="font-bold text-2xl">{children}</h1>;
}
