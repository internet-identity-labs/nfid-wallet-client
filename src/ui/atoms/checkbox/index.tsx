import clsx from "clsx"

export interface ICheckbox {
  value: string
  isChecked: boolean
  onChange: (isChecked: boolean, value: string) => void
  className?: string
}

export const Checkbox = ({
  value,
  isChecked,
  onChange,
  className,
}: ICheckbox) => {
  return (
    <input
      className={clsx(
        "rounded-[3px] h-[18px] w-[18px] border border-black-base",
        className,
      )}
      type="checkbox"
      id={value}
      checked={isChecked}
      onChange={() => onChange(isChecked, value)}
    />
  )
}
