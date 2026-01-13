import clsx from "clsx"

import { IconCmpArrowRight } from "@nfid/ui/atoms/icons"
import { ChangeEvent } from "react"
import { UseFormRegisterReturn } from "react-hook-form"

interface IInputTrigger {
  onShowModal?: () => void
  placeholder?: string
  setValue: (value?: string) => void
  value?: string
  errorText?: string
  registerFunction?: UseFormRegisterReturn<string>
}

export const InputAddressTrigger = ({
  onShowModal,
  placeholder,
  setValue,
  value,
  errorText,
  registerFunction,
}: IInputTrigger) => (
  <>
    <div
      className={clsx(
        "border border-black dark:border-zinc-400 rounded-[12px] cursor-pointer h-14",
        "flex items-center justify-between",
        "text-black dark:text-white pl-4",
        errorText && "!border-red-600 dark:!border-red-500 ring ring-red-100",
      )}
    >
      <input
        autoComplete="off"
        id="input"
        className={clsx(
          "outline-none bg-transparent w-full h-11",
          "text-sm",
          "placeholder:text-gray-400 placeholder:text-zinc-400",
        )}
        placeholder={placeholder}
        onChangeCapture={(e: ChangeEvent<HTMLInputElement>) =>
          setValue(e.target.value)
        }
        {...registerFunction}
        value={value}
      />
      <div
        className={clsx(
          "flex items-center justify-center",
          "w-12 hover:opacity-70 h-full",
          !onShowModal && "hidden",
        )}
        onClick={onShowModal}
      >
        <IconCmpArrowRight />
      </div>
    </div>
    <div
      className={clsx("absolute", "text-xs py-1 text-red dark:text-red-500")}
    >
      {errorText}
    </div>
  </>
)
