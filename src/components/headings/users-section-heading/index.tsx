type Props = {
  icon: React.ReactNode;
  children: React.ReactNode;
};

export function UsersSectionHeading({ icon, children }: Props) {
  return (
    <h2 className="flex items-center gap-2">
      {icon}
      <span className="font-bold text-lg">{children}</span>
    </h2>
  );
}
