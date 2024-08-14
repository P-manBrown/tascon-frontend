type LabelProps = Omit<React.ComponentPropsWithoutRef<'label'>, 'className'>

export function Label({ children, htmlFor, ...rest }: LabelProps) {
  return (
    <label className="mb-1 text-sm font-bold" htmlFor={htmlFor} {...rest}>
      {children}
    </label>
  )
}
