type Props = {
  children: string;
};

export function TaskGroupNameHeading({ children }: Props) {
  return <h1 className="truncate font-bold text-2xl">{children}</h1>;
}

export function LoadingTaskGroupNameHeading() {
  return <span className="skeleton my-1 block h-6 w-60 rounded-md" />;
}
