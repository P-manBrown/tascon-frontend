type LabelProps = Omit<React.ComponentPropsWithoutRef<'label'>, 'className'>

export function Label({ children, ...rest }: LabelProps) {
  return (
    <label className="mb-1 text-sm font-bold" {...rest}>
      {children}
    </label>
  )
}
