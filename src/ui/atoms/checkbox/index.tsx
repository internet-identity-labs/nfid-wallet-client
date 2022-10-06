import clsx from "clsx"

export interface ICheckbox {
  value: string
  isChecked: boolean
  onChange: (isChecked: boolean, value: string) => void
}

export const Checkbox = ({ value, isChecked, onChange }: ICheckbox) => {
  return (
    <input
      className={clsx(
        "rounded-[3px] h-[18px] w-[18px] border border-black-base",
      )}
      type="checkbox"
      id={value}
      checked={isChecked}
      onChange={() => onChange(isChecked, value)}
    />
  )
}
