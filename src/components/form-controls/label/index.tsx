type LabelProps = Omit<React.ComponentPropsWithoutRef<"label">, "className">;

export function Label({ children, htmlFor, ...rest }: LabelProps) {
  return (
    // Forwarding the typed props to the underlying element is intended.
    // nosemgrep: react-props-spreading
    <label className="mb-1 font-bold text-sm" htmlFor={htmlFor} {...rest}>
      {children}
    </label>
  );
}
