type Props = {
  isToggleOn: boolean
}

const layoutClasses = 'inline-block align-middle'
const shapeClasses = 'h-6 w-11 rounded-full'

export function ToggleSwitch({ isToggleOn }: Props) {
  return (
    <span
      className={`${layoutClasses} ${shapeClasses} flex-shrink-0 p-0.5 after:block after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] ${
        isToggleOn ? 'bg-blue-600 after:translate-x-full' : 'bg-gray-200'
      }`}
    />
  )
}

export function LoadingToggleSwitch() {
  return <span className={`skeleton ${layoutClasses} ${shapeClasses}`} />
}
