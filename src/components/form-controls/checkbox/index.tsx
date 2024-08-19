type Props = {
  checked: boolean
  disabled: boolean
  toggleIcon: React.ReactElement
  description: React.ReactElement
  onClick?: (ev: React.MouseEvent<HTMLLabelElement>) => void
  onKeyDown: (ev: React.KeyboardEvent<HTMLLabelElement>) => void
  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void
}

export function Checkbox({
  toggleIcon,
  description,
  onClick,
  onKeyDown,
  ...rest
}: Props) {
  return (
    <label
      className="block w-fit cursor-pointer focus-visible:outline-offset-4 has-[input:disabled]:cursor-wait"
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <input type="checkbox" className="peer hidden" {...rest} />
      <span className="peer-disabled:animate-pulse">{toggleIcon}</span>
      {description}
    </label>
  )
}
