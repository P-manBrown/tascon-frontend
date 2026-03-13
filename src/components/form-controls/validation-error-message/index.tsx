type Props = {
  children: string | undefined;
};

export function ValidationErrorMessage({ children }: Props) {
  return <p className="px-1 font-semibold text-red-600 text-sm">{children}</p>;
}
