import * as SwitchPrimitive from "@radix-ui/react-switch"
import clsx from "clsx"

export interface ISwitch {
  onChange: (checked: boolean) => void
  isChecked?: boolean
}
export const Switch = ({ onChange, isChecked }: ISwitch) => {
  return (
    <SwitchPrimitive.Root
      className={clsx(
        "group",
        "radix-state-checked:bg-blue",
        "radix-state-unchecked:bg-gray-200 dark:radix-state-unchecked:bg-gray-800",
        "relative inline-flex items-center h-[24px] w-[48px] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
        "focus:outline-none focus-visible:ring focus-visible:ring-blue focus-visible:ring-opacity-75",
      )}
      onCheckedChange={onChange}
      checked={isChecked}
    >
      <SwitchPrimitive.Thumb
        className={clsx(
          "group-radix-state-checked:translate-x-6",
          "group-radix-state-unchecked:translate-x-0.5",
          "pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
        )}
      />
    </SwitchPrimitive.Root>
  )
}
