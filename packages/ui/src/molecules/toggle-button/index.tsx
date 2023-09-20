import clsx from "clsx"
import { useEffect, useState } from "react"

interface IToggleButton {
  className?: string
  firstValue: string | JSX.Element
  secondValue: string | JSX.Element
  onChange: (value: boolean) => void
  defaultValue?: boolean
  id?: string
}

export const ToggleButton: React.FC<IToggleButton> = ({
  firstValue,
  secondValue,
  className,
  onChange,
  defaultValue,
  id,
}) => {
  const [value, setValue] = useState(defaultValue ?? false)

  useEffect(() => {
    onChange(value)
  }, [onChange, value])

  return (
    <div
      className={clsx(
        "w-full h-7 rounded-md bg-gray-100 cursor-pointer",
        "grid grid-cols-2 relative select-none",
        className,
      )}
      onClick={() => setValue(!value)}
      id={id}
    >
      <div
        className={clsx(
          "text-center text-black",
          "font-semibold text-xs leading-7",
          "flex items-center justify-center",
        )}
      >
        {firstValue}
      </div>
      <div
        className={clsx(
          "text-center text-black",
          "font-semibold text-xs leading-7",
          "flex items-center justify-center",
        )}
      >
        {secondValue}
      </div>
      <div
        className={clsx(
          "absolute h-7 w-1/2 rounded-md",
          "bg-blue-600 leading-7 text-xs",
          "text-center text-white font-semibold",
          "transition-transform",
          "flex items-center justify-center",
          value && "translate-x-full",
        )}
      >
        {!value ? firstValue : secondValue}
      </div>
    </div>
  )
}
