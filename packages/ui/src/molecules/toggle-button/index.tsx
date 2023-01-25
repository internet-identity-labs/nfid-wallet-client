import clsx from "clsx"

interface IToggleButton extends React.HTMLAttributes<HTMLDivElement> {
  firstValue: string
  secondValue: string
  value: boolean
  toggleValue: () => void
}

export const ToggleButton: React.FC<IToggleButton> = ({
  firstValue,
  secondValue,
  className,
  value,
  toggleValue,
}) => {
  return (
    <div
      className={clsx(
        "w-full h-7 rounded-md bg-gray-100 cursor-pointer",
        "grid grid-cols-2 relative select-none",
        className,
      )}
      onClick={toggleValue}
    >
      <div
        className={clsx(
          "text-center text-black",
          "font-semibold text-xs leading-7",
        )}
      >
        {firstValue}
      </div>
      <div
        className={clsx(
          "text-center text-black",
          "font-semibold text-xs leading-7",
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
          value && "translate-x-full",
        )}
      >
        {!value ? firstValue : secondValue}
      </div>
    </div>
  )
}
