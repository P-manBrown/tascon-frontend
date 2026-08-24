type LabelProps = Omit<React.ComponentPropsWithoutRef<"label">, "className">;

export function Label({ children, htmlFor, ...rest }: LabelProps) {
  return (
    <label className="mb-1 font-bold text-sm" htmlFor={htmlFor} {...rest}>
      {children}
    </label>
  );
}
