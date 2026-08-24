type Props = {
  children: React.ReactNode;
};

export default function SharedTaskLayout({ children }: Props) {
  return <div className="mx-auto my-3 w-[90%] md:w-160">{children}</div>;
}
